import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Tag, Form, Input, Select } from 'antd';
import './CreateStudyPage.less';
//import FormItem from 'antd/es/form/FormItem';
import { sendEmail, getAllStudents, getResearchers, addStudy, getStudent, getAllClassrooms, getSession, createStudentInvite} from '../../Utils/requests';

const { Option } = Select;
const studyTagsDefault = ["qualitative", "quantitative", "design", "TBD"];

//Out of concern for it working, though TODO: Use the below function to deduplicate useEffect bloat below
// const fetchData = async (getDataFunction, setDataFunction, errorMessage) => {
//   try {
//     const dataRes = await getDataFunction();
//     if (dataRes.error) {
//       console.error(errorMessage);
//     } else {
//       console.log(dataRes.data);
//       setDataFunction(dataRes.data);
//     }
//   } catch (error) {
//     console.error(`Error fetching data: ${errorMessage}`, error);
//   }
// };

const CreateStudyPage =()=>{
  const [students, setStudents] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedStudentsData, setSelectedStudentsData] = useState([]);
  const [selectedClassrooms, setSelectedClassroomsData] = useState([]);
  const [checkboxValues, setCheckboxValues] = useState({});
  const [selectedStudyTag, setSelectedStudyTag] = useState(null);
  const [selectedResearchers, setSelectedResearchers] = useState([]);
  const [researchers, setResearchers] = useState([]);
  const navigate = useNavigate();
  const [studyForm] = Form.useForm();
  const [checkboxForm] = Form.useForm();
  const [searchBarForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);

  //=== Fetch All Data === 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentsRes = await getAllStudents();
        if (studentsRes.error) {
          console.error('Failed to retrieve students');
        } else {
          setStudents(studentsRes.data);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const classroomsRes = await getAllClassrooms();
        if (classroomsRes.error) {
          console.error('Failed to retrieve classrooms');
        } else {
          setClassrooms(classroomsRes.data);
        }
      } catch (error) {
        console.error('Error fetching classrooms:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchResearchers = async () => {
      console.log('Fetching researchers');
      try {
        const researchersRes = await getResearchers();
        if (researchersRes.error) {
          console.error('Failed to retrieve researchers');
        } else {
          //send email to researcher
          setResearchers(researchersRes.data);
        }
      } catch (error) {
        console.error('Error fetching researchers:', error);
      }
    };
    fetchResearchers();
  }, []);

  const handleStudentChange = async (selectedValues) => {
    const studentsData = [];
    for (const studentID of selectedValues) {
      const student = await getStudent(studentID);
      studentsData.push(student.data);
    }
    setSelectedStudentsData(studentsData);
  };

  const handleClassroomChange = async (selectedValues) => {
    const classroomData = [];
    for (const classroomID of selectedValues) {
      //instead of getting classroom by id, search from the list of all classrooms
      const allClasses = await getAllClassrooms();
      const classroom = allClasses.data.find((classroom) => classroom.id === classroomID);
      //append to classroomData
      classroomData.push(classroom);
    }
    setSelectedClassroomsData(classroomData);
  }
    
  const handleCheckboxChange = (checkboxId) => (e) => {
    setCheckboxValues((prevValues) => ({
      ...prevValues,
      [checkboxId]: e.target.checked,
    }));
  };
  
  const showModal = () => {
    setIsModalVisible(true);
  };

  const ResetCheckboxEffect = ({ checkboxForm, checkboxValues }) => {
    useEffect(() => {
      checkboxForm.setFieldsValue({
        'Profile Info': false,
        'Access to Code Samples': false,
        'Messaging and Emails': false,
        'Access to Video/Lesson Usage': false,
        'Screen Recording': false,
      });
    }, [checkboxValues]);
  
    return null;
  };

  const handleSubmitStudy = async () => {
    /*
      NewStudy{
        studyID	integer
        studyDescription	string
        students	[string]
        classrooms	[string]
        researchers	[string]
        studyName	string
        studyTag	string
        Enum:
        [ qualitative, quantitative ]
        consentOptions	string
        Enum:
        [ profile, code_samples, emails_messages, video_lesson_usage, screen_recording ]
        published_at	string($date-time)
        created_by	string
        updated_by	string
        student_invites [string]
      }
    */
    
    // Get study form values
    const studyValues = studyForm.getFieldsValue();
    //sanitize data
    //TODO: Fix errors relating to null value
    studyValues['Study name'] = studyValues['Study name'].replace(/[^a-zA-Z0-9 ]/g, "");
    studyValues['Study ID'] = studyValues['Study ID'].replace(/[^a-zA-Z0-9 ]/g, "");
    //check if defined 
    if (studyValues['Study description'] === undefined) {
      studyValues['Study description'] = "";
    } else {
      studyValues['Study description'] = studyValues['Study description'].replace(/[^a-zA-Z0-9 ]/g, "");
    }
    //keep @ and . for email
    //studyValues['Student Email'] = studyValues['Student Email'].replace(/[^a-zA-Z0-9@. ]/g, "");

    // Use the updated checkboxValues state
    const values = {
      ...studyValues,
      checkboxes: checkboxValues,
      selectedStudentsData: selectedStudentsData,
      newResearchers: selectedResearchers,
      selectTags: selectedStudyTag.toString(),
      classrooms: selectedClassrooms,
    };

    // Adjust the email template creation according to your form field names
    const emailTemplate = {
      name: values['Study name'],
      studyID: values['Study ID'],
      description: values['Study description'],
      //studentEmail: values['Student Email'],
      checkboxes: values.checkboxes,
      searchBar: values.searchBar,
    };
    const consentOptionsReformat = {};
    for (const [key, value] of Object.entries(values.checkboxes)) {
      if (value) {
        consentOptionsReformat[key] = true;
      }
    }

    if (!values.newTag) {
      values.newTag = [];
      values.newTag.push("");
    }

    //iterate through classrooms and add students to study
    for (const classroom of values.classrooms) {
      //use getStudent
      for (const student of classroom.students) {
        //add them to study
        //get student
        const studentData = await getStudent(student.id);
        //add study to selected student
        selectedStudentsData.push(studentData.data);
      }
    }

    //Iterate through students to create appropriate invites
    console.error(selectedStudentsData)
    let consentingStudents = []
    for (const student of selectedStudentsData) {
      console.log("Checking" + student.name)
      if(student.sessions.length > 0){
        for( const session of student["sessions"]){
          const fetchedSession = await getSession(session.id).then(x => x.data)
          console.warn(fetchedSession)
          for( const sessionStudent of fetchedSession["students"]){
            consentingStudents.push(sessionStudent)
          }
        }
      }
    }
    console.info("Consenting Students:")
    //deduplicate invites list
    const result = [];
    const map = new Map();
    for (const item of consentingStudents) {
        if(!map.has(item.id)){
            map.set(item.id, true);    // set any value to Map
            result.push(item);
        }
    }
    consentingStudents = result;
    console.log(consentingStudents);

    //Deduplicated selected student data
    const result2 = [];
    const map2 = new Map();
    for (const item of selectedStudentsData) {
        if(!map2.has(item.id)){
            map2.set(item.id, true);
            result2.push(item);
        }
    }
    setSelectedStudentsData(result2);

    const studyData = {
      studyID: values['Study ID'],
      studyDescription: values['Study description'],
      students: values.selectedStudentsData,
      classrooms: values.classrooms,
      researchers: values.newResearchers,
      studyName: values['Study name'],
      studyTag: values.selectTags,
      consentOptions: consentOptionsReformat,
      student_invites: []
    }
    console.log(studyData);

    //post study to database
    await addStudy(studyData);
    //send email to all added researchers
    for (const researcher of values.newResearchers) {
      const emailTemplate = {
        name: researcher.first_name + ' ' + researcher.last_name,
        email: researcher.researcherEmail,
        studyID: values['Study ID'],
      }
      sendEmail(emailTemplate);
    }
    await setTimeout(async () =>{
    for(let student of consentingStudents){
      let invite = {
        study: parseInt(studyData.studyID),
        student: student.id,
        Consent: false,
      }
      await createStudentInvite(invite).then(x => console.log(x))
    }}, 1000)

    console.log("DONEDONE🚨")
    

    // Clear form fields
    studyForm.resetFields();
    checkboxForm.resetFields();
    searchBarForm.resetFields();
    setSelectedStudentsData([]);
    setSelectedClassroomsData([]);
    setSelectedStudyTag(null);
    setSelectedResearchers([]);
    setIsModalVisible(false);
  }
  
  const handleCancel = () => {
    setIsModalVisible(false);
  }

  

  return (<>
      <div className='menu-bar'>
        <div id='create-study-header'>Create New study</div>
        <button
          className='activity-level-return'
          onClick={() => navigate('/researcher/report')}
        >
          Return to Dashboard
        </button>
      </div>
      <div id='button-container'>
        <Form form={studyForm} id={"study-form"}>
          <h1 id="new-study-header">Study Information</h1>
          <Form.Item
          name="Study name"
          label="Name"
          rules={[
            {
              required: true,
              message: 'Please enter name of study',
            },
          ]}> 
            <Input/>
          </Form.Item>
          <Form.Item
          name = "Study ID"
          label="ID"
          rules={[
            {
              required: true,
              message: 'Please enter ID of study',
            },
          ]}>
            <Input/>
          </Form.Item>
          <Form.Item
          name="Study description"
          label="Description">
            <textarea
            style={{ maxHeight: '100px', resize: 'vertical', width: '100%'}}>

            </textarea>
            
          </Form.Item>
            <Form.Item>
            <Select
              className='select'
              placeholder='Select a Study Tag'
              value={selectedStudyTag}
              onChange={(value) => setSelectedStudyTag(value)}
              allowClear
            >
              {
                studyTagsDefault.map((tag) => (
                  <Select.Option key={tag} value={tag}>
                    {tag}
                  </Select.Option>
                ))
              }
            </Select>
          </Form.Item>
          <Form.Item>
            <Select
              mode='multiple'
              className='select'
              placeholder='Select a Researcher'
              onChange={(value) => setSelectedResearchers(value)}
              allowClear
            >
              {researchers.map((researcher) => (
                <Select.Option key={researcher.id} value={researcher.id}>
                  {researcher.first_name} {researcher.last_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
        <Form form={checkboxForm} id={"checkbox-form"}>
          <Form.Item className="checkbox-item">
            <input type="checkbox" id="checkbox-1" onChange={handleCheckboxChange("Profile Info")} />
            <label htmlFor="checkbox-1" className="checkbox-label">Profile Info</label>
          </Form.Item>
          <Form.Item className="checkbox-item">
            <input type="checkbox" id="checkbox-2" onChange={handleCheckboxChange("Access to Code Samples")}/>
            <label htmlFor="checkbox-2" className="checkbox-label">Access to Code Samples</label>
          </Form.Item>
          <Form.Item className="checkbox-item">
            <input type="checkbox" id="checkbox-3" onChange={handleCheckboxChange("Messaging and Emails")}/>
            <label htmlFor="checkbox-3" className="checkbox-label">Messaging and Emails</label>
          </Form.Item>
          <Form.Item className="checkbox-item">
            <input type="checkbox" id="checkbox-4" onChange={handleCheckboxChange("Access to Video/Lesson Usage")}/>
            <label htmlFor="checkbox-4" className="checkbox-label">Access to Video/Lesson Usage</label>
          </Form.Item>
          <Form.Item className="checkbox-item">
            <input type="checkbox" id="checkbox-5" onChange={handleCheckboxChange("Screen Recording")}/>
            <label htmlFor="checkbox-5" className="checkbox-label">Screen Recording</label>
          </Form.Item>
        </Form>
        <ResetCheckboxEffect checkboxForm={checkboxForm} checkboxValues={checkboxValues} />
        <Form form={searchBarForm} id={"search-bar-form"}>
          <Form.Item>
          <Select
              mode="multiple"
              placeholder="Search for a Student"
              onChange={handleStudentChange}
              value={selectedStudentsData.map(student => student.id)}  // Use selectedStudentsData
              className="search-bar"
            >
              {students.map(student => (
                <Option key={student.id} value={student.id}>
                  {student.name}
                </Option>
              ))}
            </Select>
            <Select
              mode="multiple"
              placeholder="Search for a Classroom"
              onChange={handleClassroomChange}
              value={selectedClassrooms.map((classroom) => classroom.id)}
              className="search-bar"
            >
              {classrooms.map((classroom) => (
                <Option key={classroom.id} value={classroom.id}>
                  {classroom.id !== null && classroom.id !== undefined ? classroom.id : 'No ID'} - {classroom.name}
                </Option>
              ))}
            </Select>

          </Form.Item>
          <Button className='add-researcher-button' onClick={showModal}>
              Submit Study Request 
          </Button>
          <Modal title="Submit Study Request" visible={isModalVisible} onOk={handleSubmitStudy} onCancel={handleCancel}>
            <p>Are you sure you want to submit this study request?</p>
          </Modal>
          
        </Form>
      </div>
  </>)
};

export default CreateStudyPage;