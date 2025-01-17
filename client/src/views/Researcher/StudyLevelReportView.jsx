import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSessions, getStudent, getStudy } from '../../Utils/requests';
import './StudyLevelReportView.less';

const StudyLevelReportView = () => {
  const { id } = useParams();
  const [students, setStudents] = useState([])
  const navigate = useNavigate();

  useEffect(function () {
    const getData = async () => {
      const study = await getStudy(id).then(x => x.data);
      console.log(study)

      const consentingStudents = []
      for (let student of study.students){
        if (study.student_invites.some(el => el.student === student.id && el.Consent)){
          consentingStudents.push(await getStudent(student.id).then(x=>x.data));
        }
      }

      setStudents(consentingStudents);
      console.log(students);
      const allSessions = await getSessions().then(x => x.data);
      const usableSessions = []
      for(let session of allSessions){
        if(session.students.every((sessionStudent) => students.some((student) => student.id === sessionStudent.id))){
          usableSessions.push(session);
        }
      }

      console.log(usableSessions)

      
      // const l = session.data.saves[0]?.replay.length;
      // const fetchedClicks = session.data.saves[0]?.replay[l - 1]?.clicks;
      // setClicks(fetchedClicks);
    };
    getData();
  }, []);
  
  return (
    <>
      <div className='menu-bar'>
        <div id='activity-level-report-header'>Study Level Report</div>
        <button
          id={'activity-level-return'}
          className={`btn-${'primary'} btn-${'sm'}`}
          type='button'
          onClick={() => navigate(-1)}
        >
          Return to Study Level
        </button>
      </div>

      <main id='content-wrapper'>

      </main>
    </>
  );
};

export default StudyLevelReportView;
