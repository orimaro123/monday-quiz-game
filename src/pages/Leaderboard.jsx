import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  handleAmountChange,
  handleHintsChange,
  handleLifelinesChange,
  handleScoreChange,
} from "../redux/actions";
import localforage from "localforage";
import useGlobalTimer from "../hooks/useGlobalTimer";

export default function Leaderboard() {
  const dispatch = useDispatch();
  const history = useHistory();
  const [inputUsername, setInputUsername] = useState("");
  const [leaderboardData, setLeaderboardData] = useState([]);
  const { score, hints } = useSelector((state) => state);
  const { getDuration } = useGlobalTimer();

  const handleBackToSettings = () => {
    dispatch(handleScoreChange(0));
    dispatch(handleAmountChange(10));
    dispatch(handleHintsChange(2));
    dispatch(handleLifelinesChange(1));
    history.push("/");
  };

  useEffect(() => {
    refreshLeaderboardData();
  }, []);

  const refreshLeaderboardData = async () => {
    const items = [];
    await localforage.iterate((value) => {
      items.push({
        ...value,
        score: Number(value.score),
        hints: Number(value.hintsCount),
      });
    });
    items.sort((item1, item2) => item2.score - item1.score);
    setLeaderboardData(items);
  };

  const handleSaveToLeaderboard = async () => {
    let username, hintsCount, durationSeconds;

    document.getElementById("save-button").style.visibility = "hidden";

    //fill them
    username = inputUsername;
    durationSeconds = getDuration();
    hintsCount = hints;

    const items = [];
    await localforage.iterate((value) => {
      items.push({
        ...value,
        score: Number(value.score),
        hints: Number(value.hintsCount),
      });
    });

    items.sort((item1, item2) => item2.score - item1.score);

    if (items.length < 10) {
      //save to db
      localforage
        .setItem(username, {
          username,
          score,
          hintsCount,
          durationSeconds,
        })
        .then(() => {
          //refresh leaderboard data from db
          refreshLeaderboardData();
        });
    } else {
      let worstPlayer = items[items.length - 1];

      if (score >= worstPlayer.score) {
        //remove worst user from list
        localforage.removeItem(worstPlayer.username).then(() => {
          // Save my score instead
          localforage.setItem(username, {
            username,
            score,
            hintsCount,
            durationSeconds,
          });
          //refresh leaderboard data from db
          refreshLeaderboardData();
        });
      }
    }
  };

  return (
    <section>
      <header>
        <h1>Leaderboard</h1>
        <div>
          <input
            placeholder="Please write your name"
            type="text"
            value={inputUsername}
            onChange={(evt) => setInputUsername(evt.target.value)}
          />
          <button id="save-button" onClick={handleSaveToLeaderboard}>
            Submit
          </button>
        </div>
      </header>
      <article>
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Score</th>
              <th>Hints used</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((item) => (
              <tr key={item.username}>
                <td>{item.username}</td>
                <td>{item.score}</td>
                <td>{item.hintsCount}</td>
                <td>{item.durationSeconds}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
      <footer>
        <button
          className="return"
          onClick={handleBackToSettings}
          variant="outlined"
        >
          Back to home page
        </button>
      </footer>
    </section>
  );
}