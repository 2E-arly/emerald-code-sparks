import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getActivityToolbox } from '../../Utils/requests.js';
import BlocklyCanvasPanel from '../../components/ActivityPanels/BlocklyCanvasPanel/BlocklyCanvasPanel';
import NavBar from '../../components/NavBar/NavBar';

export default function Workspace({ handleLogout }) {
  const [activity, setActivity] = useState({});

  useEffect(() => {
    const localActivity = JSON.parse(localStorage.getItem('my-activity'));
    const navigate = useNavigate();

    if (localActivity) {
      if (localActivity.toolbox) {
        setActivity(localActivity);
      } else {
        getActivityToolbox(localActivity.id).then((res) => {
          if (res.data) {
            const loadedActivity = { ...localActivity, toolbox: res.data.toolbox };

            localStorage.setItem('my-activity', JSON.stringify(loadedActivity));
            setActivity(loadedActivity);
          } else {
            message.error(res.err);
          }
        });
      }
    } else {
      navigate(-1);
    }
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="container flex flex-row nav-padding">
      <NavBar isStudent />
      <BlocklyCanvasPanel
        activity={activity}
        lessonName={`${activity.lesson_module_name}, Activity ${activity.number}`}
        handleGoBack={handleGoBack}
        handleLogout={handleLogout}
        isStudent
      />
    </div>
  );
}
