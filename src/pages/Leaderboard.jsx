import React, { useEffect, useState, Fragment } from "react";
import { Helmet } from "react-helmet";
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
  const [isShowSaveButton, setIsShowSaveButton] = useState(true);
  const { score } = useSelector((state) => state);
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
      items.push({ ...value, score: Number(value.score) });
    });
    items.sort((item1, item2) => item2.score - item1.score);
    setLeaderboardData(items.slice(0, 10));
  };

  const handleSaveToLeaderboard = () => {
    let username, hintsCount, durationSeconds;

    //fill them
    username = inputUsername;
    durationSeconds = getDuration();

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
        setIsShowSaveButton(false);
      });
  };

  return (
    <Fragment>
      <Helmet>
        <title>Leaderboard</title>
      </Helmet>
      <section>
        <header>
          <h1>Leaderboard</h1>
          <div>
            <input
              placeholder="Enter your name and click save"
              type="text"
              value={inputUsername}
              onChange={(evt) => setInputUsername(evt.target.value)}
            />
            {isShowSaveButton && (
              <button onClick={handleSaveToLeaderboard}>Save here</button>
            )}
          </div>
        </header>
        <article>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Username</th>
                <th>Score</th>
                <th>Time [seconds]</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((item, index) => (
                <tr key={item.username}>
                  <td>{index + 1}</td>
                  <td>{item.username}</td>
                  <td>{item.score}</td>
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
    </Fragment>
  );
}
