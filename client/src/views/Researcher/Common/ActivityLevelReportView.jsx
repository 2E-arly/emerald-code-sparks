import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getSession } from '../../../Utils/requests';
import './ActivityLevelReportView.less';

const ActivityLevelReportView = () => {
  const { id } = useParams();
  const [session, setSession] = useState({});
  const [studentsName, setStudentsName] = useState([]);
  const [studentsPartner, setStudentsPartner] = useState([]);
  const [className, setClassName] = useState([]);
  const [clicks, setClicks] = useState(0);
  const navigate = useNavigate();

  useEffect(function () {
    const getData = async () => {
      const session = await getSession(id);
      setSession(session.data);

      const fetchedStudents = session.data.students[0].name;
      setStudentsName(fetchedStudents);

      const fetchedPartner = session.data.students
        .slice(1)
        .map((student) => student.name);
      setStudentsPartner(fetchedPartner);

      const fetchedClassroomNames = session.data.classroom.name;
      setClassName(fetchedClassroomNames);

      const l = session.data.saves[0]?.replay.length;
      const fetchedClicks = session.data.saves[0]?.replay[l - 1]?.clicks;
      setClicks(fetchedClicks);
    };
    getData();
  }, []);

  const timeConverter = (timestamp) => {
    var dateVal = new Date(timestamp).toLocaleString();
    return dateVal;
  };

  const calculateEndTime = () => {
    if (session.saves?.length) {
      if (session.saves[session.saves.length - 1].created_at) {
        return session.saves[session.saves.length - 1].created_at;
      }
      return 'Unknown, no saves';
    }
  };

  const showReplayButton = () => {
    if (session.saves?.length) {
      const latestSave = session.saves[session.saves.length - 1];
      return (
        <Link id='replay-btn' className='btn' to={`/replay/${latestSave.id}`}>
          View Code Replay
        </Link>
      );
    }
  };
  return (
    <>
      <div className='menu-bar'>
        <div id='activity-level-report-header'>Activity Level - Student Report</div>
        <button
          id={'activity-level-return'}
          className={`btn-${'primary'} btn-${'sm'}`}
          type='button'
          onClick={() => navigate(-1)}
        >
          Return to Activity Level
        </button>
      </div>

      <main id='content-wrapper'>
        <section id='container-section'>
          <section id='student-report-section'>
            <p>
              <strong>Student Name: </strong>
              {studentsName}
            </p>
            <p>
              <strong>Partner Name: </strong>
              {studentsPartner.length > 0 ? studentsPartner.join(', ') : ''}
            </p>
            <p>
              <strong>Class Name: </strong>
              {className}
            </p>
            <br />
            <p>
              <strong>Started: </strong>
              {timeConverter(session.created_at)}
            </p>
            <p>
              <strong>Ended: </strong>
              {timeConverter(calculateEndTime())}
            </p>
            <p>
              <strong>Mouse Clicks: </strong>
              {clicks}
            </p>
            <p>
              <strong>Times Tested: </strong>
              {session.submissions?.length} times
            </p>
          </section>
        </section>
        <br />
        {showReplayButton()}
      </main>
      </>
  );
};

export default ActivityLevelReportView;
