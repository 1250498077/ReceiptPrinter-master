
import React, { useContext, useState, useCallback, useRef, useEffect } from 'react';
import People from "./People";


import { Space, Table, Drawer, Form, Input, Button, message } from 'antd';
const { Search } = Input;
const { TextArea } = Input;


const App = () => {
  const people = useRef(new People());
  const [messageApi, contextHolder] = message.useMessage();
  const key = 'updatable';
  const [actionType, setActionType] = useState(false);
  const [textAreaValue, setTextAreaValue] = useState("");
  const [open, setOpen] = useState(false);
  const [list, setList] = useState([]);

  const [initialValues, setInitialValues] = useState({});
  useEffect(() => {
    setList(people.current.list);
  }, []);
  const success = () => {
    messageApi.open({
      key,
      type: 'loading',
      content: 'ChatGPT Loading ...',
      duration: 30
    });
  };
  const onFinish = (values) => {
    setInitialValues({});
    if (actionType === "update") {
      people.current.updatePerson(values);
      setOpen(false);
      setList(JSON.parse(JSON.stringify(people.current.list)));
    } else {
      people.current.addPerson(values);
      setOpen(false);
      setList(JSON.parse(JSON.stringify(people.current.list)));
    }
  }
  const getTable = () => {
    const columns = [
      {
        title: '姓名',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '年龄',
        dataIndex: 'age',
        key: 'age',
      },
      {
        title: '性别',
        dataIndex: 'gender',
        key: 'gender',
      },
      {
        title: '老家',
        dataIndex: 'hometown',
        key: 'hometown',
      },
      {
        title: '职业',
        dataIndex: 'occupation',
        key: 'occupation',
      },
      {
        title: 'Action',
        key: 'action',
        render: (_, record) => (
          <Space size="middle">
            <a onClick={() => {
              setOpen(true);
              setInitialValues(record);
              setActionType("update");
            }}>edit</a>
            <a onClick={() => {
              people.current.removePerson(record);
              setList(JSON.parse(JSON.stringify(people.current.list)));
            }}>delete</a>
          </Space>
        ),
      },
    ];
    const onSearch = (value) => {
      setList(JSON.parse(JSON.stringify(people.current.findPerson(value))));
    }
    // useEffect(() => {
    //   success();
    // }, [open])
    return (
      <div style={{ padding: 20 }}>
        {contextHolder}
        <Button style={{ marginRight: 10 }} type="primary" onClick={() => {
          setInitialValues(() => { });
          setOpen(true);
          setActionType("add");
        }}>
          News
        </Button>
        <Search style={{ marginLeft: 20 }} placeholder="input search text" onSearch={onSearch} style={{ width: 200 }} />
        <Button style={{ marginRight: 10 }} type="primary" onClick={() => {
          success();
          people.current.toChatGPT(textAreaValue, (result) => {
            if (result.result) {
              messageApi.open({
                key,
                type: 'success',
                content: result.response,
                duration: 2,
              });
              setList(JSON.parse(JSON.stringify(people.current.list)));
            } else {
              messageApi.open({
                key,
                type: 'fail',
                content: result.response,
                duration: 2,
              });
            }
          });
        }}>
          执行
        </Button>
        <div style={{ marginTop: 10 }}>
          <TextArea
            placeholder='你可以要求chatgpt帮助你完成某些内容'
            onChange={(e) => {
              setTextAreaValue(e.target.value)
            }}
          />

        </div>

        <Table dataSource={list} columns={columns} />
        <Drawer
          onClose={() => { setOpen(false); }}
          title="Basic Drawer" placement="right" open={open}>
          {
            open ? (
              <Form
                name="basic"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ maxWidth: 600 }}
                initialValues={initialValues}
                onFinish={onFinish}
                autoComplete="off"
              >
                <Form.Item
                  label="name"
                  name="name"
                >
                  <Input disabled={actionType === "add" ? false : true} />
                </Form.Item>
                <Form.Item
                  label="age"
                  name="age"
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="gender"
                  name="gender"
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="hometown"
                  name="hometown"
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="occupation"
                  name="occupation"
                >
                  <Input />
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                  <Button type="primary" htmlType="submit">
                    Submit
                  </Button>
                </Form.Item>
              </Form>
            ) : null
          }
        </Drawer>
      </div>

    )
  }
  const getChart = () => {
    return (
      <div id="main">

      </div>
    )
  }
  return (
    <div>
      {getTable()}
      {getChart()}
    </div>
  )
}





export default App;