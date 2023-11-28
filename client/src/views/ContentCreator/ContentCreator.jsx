import React, { useState, useEffect } from 'react';

import {
  Tabs, Table, Popconfirm, message,
} from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import SavedWorkSpaceTab from '../../components/Tabs/SavedWorkspaceTab';
import UnitCreator from './UnitCreator/UnitCreator';
import LessonModuleActivityCreator from './LessonModuleCreator/LessonModuleCreator';
import {
  getLessonModuleAll,
  deleteLessonModule,
  getGrades,
} from '../../Utils/requests';
import UnitEditor from './UnitEditor/UnitEditor';
import LessonEditor from './LessonEditor/LessonEditor';

import './ContentCreator.less';

const { TabPane } = Tabs;

export default function ContentCreator() {
  const [gradeList, setGradeList] = useState([]);
  const [learningStandardList, setLessonModuleList] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const [tab, setTab] = useState(
    searchParams.has('tab') ? searchParams.get('tab') : 'home',
  );
  const [page, setPage] = useState(
    searchParams.has('page') ? parseInt(searchParams.get('page')) : 1,
  );
  const [viewing, setViewing] = useState(parseInt(searchParams.get('activity')));

  useEffect(() => {
    const fetchData = async () => {
      const [lsResponse, gradeResponse] = await Promise.all([
        getLessonModuleAll(),
        getGrades(),
      ]);
      setLessonModuleList(lsResponse.data);

      const grades = gradeResponse.data;
      grades.sort((a, b) => (a.id > b.id ? 1 : -1));
      setGradeList(grades);
    };
    fetchData();
  }, []);

  const columns = [
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
      editable: true,
      width: '22.5%',
      align: 'left',
      render: (_, key) => (
        <UnitEditor id={key.unit.id} unitName={key.unit.name} linkBtn />
      ),
    },
    {
      title: 'Lesson',
      dataIndex: 'name',
      key: 'name',
      editable: true,
      width: '22.5%',
      align: 'left',
      render: (_, key) => (
        <LessonEditor
          learningStandard={key}
          linkBtn
          viewing={viewing}
          setViewing={setViewing}
          tab={tab}
          page={page}
        />
      ),
    },
    {
      title: 'Description',
      dataIndex: 'expectations',
      key: 'character',
      editable: true,
      width: '22.5%',
      align: 'left',
    },
    {
      title: 'Delete',
      dataIndex: 'delete',
      key: 'delete',
      width: '10%',
      align: 'right',
      render: (_, key) => (
        <Popconfirm
          title="Are you sure you want to delete this learning standard?"
          icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
          onConfirm={async () => {
            const res = await deleteLessonModule(key.id);
            if (res.err) {
              message.error(res.err);
            } else {
              setLessonModuleList(
                learningStandardList.filter((ls) => ls.id !== key.id),
              );
              message.success('Delete success');
            }
          }}
        >
          <button id="link-btn">Delete</button>
        </Popconfirm>
      ),
    },
  ];

  const filterLS = (grade) => learningStandardList.filter((learningStandard) => learningStandard.unit.grade === grade.id);

  const setTabs = (grade) => (
    <TabPane tab={grade.name} key={grade.name}>
      <div id="page-header">
        <h1>Lessons & Units</h1>
      </div>
      <div id="content-creator-table-container">
        <div id="content-creator-btn-container">
          <UnitCreator gradeList={gradeList} />
          <LessonModuleActivityCreator />
        </div>
        <Table
          columns={columns}
          dataSource={filterLS(grade)}
          rowClassName="editable-row"
          rowKey="id"
          onChange={(Pagination) => {
            setViewing(undefined);
            setPage(Pagination.current);
            setSearchParams({ tab, page: Pagination.current });
          }}
          pagination={{ current: page || 1 }}
        />
      </div>
    </TabPane>
  );

  return (
    <>
      <div id="main-header">Welcome Content Creator</div>
      <Tabs
        onChange={(activeKey) => {
          setTab(activeKey);
          setPage(1);
          setViewing(undefined);
          setSearchParams({ tab: activeKey });
        }}
        activeKey={tab || 'home'}
      >
        <TabPane tab="Home" key="home">
          <div id="page-header">
            <h1>Lessons & Units</h1>
          </div>
          <div id="content-creator-table-container">
            <div id="content-creator-btn-container">
              <UnitCreator gradeList={gradeList} />
              <LessonModuleActivityCreator
                setLessonModuleList={setLessonModuleList}
                viewing={viewing}
                setViewing={setViewing}
                tab={tab}
                page={page}
              />
            </div>
            <Table
              columns={columns}
              dataSource={learningStandardList}
              rowClassName="editable-row"
              rowKey="id"
              onChange={(Pagination) => {
                setViewing(undefined);
                setPage(Pagination.current);
                setSearchParams({ tab, page: Pagination.current });
              }}
              pagination={{ current: page || 1 }}
            />
          </div>
        </TabPane>

        {gradeList.map((grade) => setTabs(grade))}

        <TabPane tab="Saved Workspaces" key="workspace">
          <SavedWorkSpaceTab
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
        </TabPane>
      </Tabs>
    </>
  );
}
