
import React, { useState, useCallback, useRef } from 'react';
import './index.css';
import { useEffect } from 'react';
import axios from 'axios';
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, coyWithoutShadows, darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';
// 设置高亮的语言
import { jsx, javascript } from "react-syntax-highlighter/dist/esm/languages/prism";
import ReactMarkdown from 'react-markdown';
import ClipboardJS from 'clipboard';
import { Drawer, Input, message, Select } from 'antd';
import roles from "./roles";

const { Search } = Input;
const { TextArea } = Input;
const { Option } = Select;

function clearLocalStorage() {
  localStorage.setItem("LOCALDATA", "[]");
}

// 封装localStorage的get方法
function getLocalStorage() {
  let arrStr = localStorage.getItem("LOCALDATA");
  if (arrStr) {
    let arr = JSON.parse(arrStr);
    return arr;
  } else {
    return [];
  }
}

const them = {
  dark: vscDarkPlus,
  light: coyWithoutShadows
};
const ENDTEXT = "__END__";

let comments = [];
let streaming = false

export default function App1() {
  const [question, setQuestion] = useState("");
  const [roleType, setRoleType] = useState("");
  const [frontPrompts, setFrontPrompts] = useState("");

  const list_container_id = useRef(null);
  const currentTexts = useRef("");
  const [count, setCount] = useState(0);
  const [messageApi, contextHolder] = message.useMessage();
  const [open, setOpen] = useState(false);
  const [openMoreFunction, setOpenMoreFunction] = useState(false);

  const [jsonData, setJsonData] = useState("{}");
  const key = 'copy';
  const postStreamList = async (callback) => {
    let requestList = [];
    comments.map((item) => {
      if (item.type === "chatgpt-url") {
        if (item.contents[0]) {
          requestList.push({ "role": "user", "content": item.contents[0].hiddenQuestion });
          requestList.push({ "role": "assistant", "content": item.contents[0].hiddenContent });
        }
      } else {
        requestList.push({ "role": "user", "content": item.name });
        if (item.contents[0] && item.contents[0].text) {
          requestList.push({ "role": "assistant", "content": item.contents[0].text });
        }
      }
    })

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": "Bearer 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"
      },
      body: JSON.stringify({
        "model": "gpt-3.5-turbo",
        "messages": requestList
      })
    };
    let count = 0;
    const streamResponse = await fetch('/chat', requestOptions);
    // const streamResponse = await fetch('/search/api/dev/stream', requestOptions);
    const reader = streamResponse.body.getReader();
    let errText = "";
    const read = () => {
      return reader.read().then(({ done, value }) => {
        count++;
        if (done) {
          console.log("victor react reviced: end");
          callback(ENDTEXT);
          return;
        }

        const textDecoder = new TextDecoder();
        // console.log("返回的数据：", textDecoder.decode(value));
        let text = "";
        const strArr = (errText + textDecoder.decode(value)).split("data: ");
        console.log("解析字符", textDecoder.decode(value))
        if (strArr) {
          for (let i = 0; i < strArr.length; i++) {
            let json = {};
            if (strArr[i] && strArr[i] !== "[DONE]") {
              try {
                json = JSON.parse(strArr[i]);
                if (json.choices.length && json.choices[0].delta.content) {
                  text = text + json.choices[0].delta.content;
                }
                errText = "";
              } catch (e) {
                console.log("出错", strArr[i])
                errText = strArr[i];
              }

            }
          }
          callback(text);
        }
        return read();
      });
    }

    read();
  }

  const postStreamListAudio = async (erjinzhi) => {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "model": "gpt-3.5-turbo",
        "messages": [{ "role": "assistant", "content": erjinzhi }]
      })
    };
    let count = 0;
    const streamResponse = await fetch('/chat', requestOptions);
    // const streamResponse = await fetch('/search/api/dev/stream', requestOptions);
    const reader = streamResponse.body.getReader();
    let errText = "";
    const read = () => {
      return reader.read().then(({ done, value }) => {
        count++;
        if (done) {
          console.log("victor react reviced: end");
          return;
        }

        const textDecoder = new TextDecoder();
        // console.log("返回的数据：", textDecoder.decode(value));
        let text = "";
        const strArr = (errText + textDecoder.decode(value)).split("data: ");
        console.log("解析字符", textDecoder.decode(value))
        if (strArr) {
          for (let i = 0; i < strArr.length; i++) {
            let json = {};
            if (strArr[i] && strArr[i] !== "[DONE]") {
              try {
                json = JSON.parse(strArr[i]);
                if (json.choices.length && json.choices[0].delta.content) {
                  text = text + json.choices[0].delta.content;
                }
                errText = "";
              } catch (e) {
                console.log("出错", strArr[i])
                errText = strArr[i];
              }

            }
          }
          console.log(text);
        }
        return read();
      });
    }
    read();
  }

  const addLocalStorage = (dataArr) => {
    var now = new Date();
    var year = now.getFullYear(); //获取完整的年份(4位,1970-????)
    var month = now.getMonth() + 1; //获取当前月份(0-11,0代表1月)
    var date = now.getDate(); //获取当前日(1-31)
    var hour = now.getHours(); //获取当前小时数(0-23)
    var minute = now.getMinutes(); //获取当前分钟数(0-59)
    var second = now.getSeconds(); //获取当前秒数(0-59)
    var timestamp = year + "-" + (month < 10 ? "0" + month : month) + "-" + (date < 10 ? "0" + date : date) + " " + (hour < 10 ? "0" + hour : hour) + ":" + (minute < 10 ? "0" + minute : minute) + ":" + (second < 10 ? "0" + second : second);
    try {
      let arrStr = localStorage.getItem("LOCALDATA");
      if (arrStr) {
        let arr = JSON.parse(arrStr);
        arr.push({
          time: timestamp,
          dataArr: dataArr
        });
        localStorage.setItem("LOCALDATA", JSON.stringify(arr));
      } else {
        let arr = [];
        arr.push({
          time: timestamp,
          dataArr: dataArr
        });
        localStorage.setItem("LOCALDATA", JSON.stringify(arr));
      }
      messageApi.open({
        key,
        type: 'success',
        content: '缓存成功',
        duration: 1
      });
    } catch (err) {
      console.error('localStorage set error: ', err);
    }
  }

  const addComment = async (e) => {
    if (question.trim() === '') {
      alert('请输入问题');
      return;
    }
    setQuestion('');
    let index = comments.length;
    comments.push({
      id: Math.random(),
      role: 'user',
      type: "chatgpt",
      name: question,
      contents: []
    });
    setCount(count + 1);
    setTimeout(async () => {
      let responseList = await getList();
      if (responseList[0].type === "chatgpt-url") {
        comments[index].type = "chatgpt-url";
      }
      comments[index].contents = responseList;
      setQuestion('');
      setCount(0);
    }, 0);
  }

  const getList = (question) => {
    let requestList = [];
    comments.map((item) => {
      if (item.type === "chatgpt-url") {
        if (item.contents[0]) {
          requestList.push({ "role": "user", "content": item.contents[0].hiddenQuestion });
          requestList.push({ "role": "assistant", "content": item.contents[0].hiddenContent });
        }
      } else {
        requestList.push({ "role": "user", "content": item.name });
        if (item.contents[0]) {
          requestList.push({ "role": "assistant", "content": item.contents[0].text });
        }
      }
    })
    return new Promise((resolve) => {
      axios.post('/search/send', {
        frequency_penalty: 0,
        max_tokens: 2048,
        model: "text-davinci-003",
        presence_penalty: 0,
        message: requestList,
        temperature: 0.5,
        top_p: 1
      }).then((response) => {

        if (Array.isArray(response.data.choices)) {
          // console.log('请求成功', response);
          let arr = response.data.choices.map((item) => {
            if (item.message.type === "chatgpt-url") {
              return {
                type: item.message.type,
                index: item.index,
                text: "我已经对这个链接学习完成，你可以向我提问关于这个链接的内容",
                hiddenQuestion: item.message.question,
                hiddenContent: item.message.content
              }
            } else {
              return {
                type: item.type,
                index: item.index,
                text: item.message.content
              }
            }
          })
          resolve(arr);
        } else {
          alert('程序错误');
        }
        // 请求成功
      }).catch((error) => {
        // 请求失败，
        console.log(error);
      });
    })
  }

  const scrollBottom = () => {
    if (!list_container_id.current) {
      return;
    }
    setTimeout(() => {
      list_container_id.current.scrollTop = list_container_id.current.scrollHeight
    }, 0);
  }

  const updateScroll = useCallback(() => {
    scrollBottom()
  })

  const addStreamComment = async ({
    question1 = "",
    isCreate = false,
    isContinue = false
  }) => {
    if (question.trim() === '' && !question1 && isContinue === false) {
      alert('请输入问题');
      return;
    }
    streaming = true;
    setQuestion('');
    let index = 0;
    // 修改不需要新数据, 创建就需要push新item
    if (isCreate || comments.length === 0) {
      console.log("走创建")
      index = comments.length;
      let questionText = question1 || question;
      if (roles[roleType]) {
        questionText = roles[roleType](question1 || question)
      }
      comments.push({
        id: Math.random(),
        role: 'user',
        type: "chatgpt",
        name: questionText,
        edit: false,
        contents: [{ index: Math.random(), text: "", edit: false }]
      });
    } else if (isContinue === true) {
      console.log("走继续")
      index = comments.length - 1;
      comments[index] = {
        ...comments[index],
        id: Math.random(),
        role: 'user',
        type: "chatgpt",
        edit: false
      };
    } else {
      console.log("走编辑")
      index = comments.length - 1;
      comments[index] = {
        id: Math.random(),
        role: 'user',
        type: "chatgpt",
        name: question1 || question,
        edit: false,
        contents: [{ index: Math.random(), text: "", edit: false }]
      };
    }
    setCount(count + 1);
    let str = comments[index].contents[0].text;
    const callback = (text) => {
      if (text === ENDTEXT) {
        streaming = false;
        setCount(1);
        return;
      }
      str = str + text;
      comments[index].contents[0].text = str;
      setQuestion('');
      setCount((count) => count + 1);
    }
    postStreamList(callback);
  }

  const copy = (index) => {
    const clipboard = new ClipboardJS("#copyBtn" + index);
    clipboard.on('success', () => {
      messageApi.open({
        key,
        type: 'success',
        content: '复制成功',
        duration: 1
      });
    });
  }
  useEffect(() => {
    const clipboard = new ClipboardJS("#copyBtnAll");
    clipboard.on('success', () => {
      messageApi.open({
        key,
        type: 'success',
        content: '复制成功',
        duration: 1
      });
    });
    comments.map((item, index) => {
      const clipboard = new ClipboardJS("#copyBtn" + index);
      clipboard.on('success', () => {
        messageApi.open({
          key,
          type: 'success',
          content: '复制成功',
          duration: 2
        });
      });
    })
  })
  console.log("comments", comments)
  const renderList = () => {
    return comments.length === 0 ?
      (<div style={{ flex: 1 }}>
        <div className='no-comment'>暂无问题，快去提问吧~</div>
      </div>)
      : (
        <div
          ref={(el) => {
            list_container_id.current = el;
          }}
          style={{ flex: 1 }}
          className="list_container"
        >
          <ul style={{ color: 'white' }}>
            {comments.map((item, index) => (
              <li key={item.id} style={{ color: 'white' }}>
                {
                  item.name ? (
                    <div className='quiz'>
                      <div className='response' style={{ marginLeft: 8 }}>
                        <div className='action_btn'>
                          <div>提问：</div>
                          <div className="copy_button" id={"copyBtn" + index} data-clipboard-text={item.name} onClick={(e) => copy(index)}>copy</div>
                          {comments.length === index + 1 ? (
                            <div
                              className="copy_button"
                              onClick={() => {
                                if (item.edit === false) {
                                  item.edit = true;
                                  setCount(count + 1);
                                } else {
                                  addStreamComment({
                                    question1: item.name,
                                    isCreate: false,
                                    isContinue: false
                                  });
                                }
                              }}>{!item.edit ? "edit" : "submit"}</div>
                          ) : null}
                          <div
                            className="copy_button"
                            onClick={() => {
                              comments.splice(index, 1);
                              setCount(count + 1);
                            }}>delete</div>

                        </div>
                        {
                          !item.edit ? <p>{item.name}</p> : (
                            <div className="">
                              <TextArea
                                rows={4}
                                defaultValue={item.name}
                                onChange={(e) => {
                                  item.name = e.target.value;
                                }}
                              />
                            </div>
                          )
                        }
                      </div>
                    </div>
                  ) : null
                }
                {
                  item.contents.length ? (
                    <>
                      <div
                        className='answer'>
                        <div style={{ marginLeft: 8, marginBottom: 10 }} >
                          <div className='action_btn'>
                            <div>回答：</div>
                            <div className="copy_button" id={"copyBtn" + index} data-clipboard-text={item.contents[0].text} onClick={(e) => copy(index)}>copy</div>
                          </div>
                          <pre style={{ width: "100%" }}><OmsSyntaxHighlight textContent={item.contents[0].text} language={"javascript"} darkMode /></pre></div>
                      </div>
                      <div>{currentTexts.current}</div>
                    </>
                  ) : <div>
                    <div style={{ display: 'flex', justifyContent: 'center', backgroundColor: 'black' }}><div className='heike'  >chatgpt</div></div>
                    <div className='answer2'>思考中...</div>
                  </div>
                }
              </li>
            ))
            }
          </ul >
        </div >
      )
  }
  const handleForm = (e) => {
    setQuestion(e.target.value)
  }

  const handleSelectChange = (value) => {
    setFrontPrompts(value);
    setRoleType(value);
  };

  useEffect(() => {
    scrollBottom()
  })

  const overWriteData = (jsonData) => {
    let jsonData1 = JSON.parse(jsonData);
    // console.log("jsonData1", jsonData1)
    comments = [];
    jsonData1.map((item, index) => {
      if (index % 2 === 0) {
        comments.push({
          id: Math.random(),
          role: 'user',
          type: "chatgpt",
          name: item.content,
          edit: false,
          contents: [{
            index: Math.random(),
            edit: false,
            text: jsonData1[index + 1].content
          }]
        })
        // console.log(comments)
        setCount(count + 1)
      }
    })
  }

  const handleLocalDataChange = (value) => {
    overWriteData(value);
  };

  useEffect(() => {
    const mp3File = document.getElementById('mp3-file');

    mp3File.addEventListener('change', () => {
      const file = mp3File.files[0];
      const reader = new FileReader();

      reader.addEventListener('loadend', () => {
        const byteArray = new Uint8Array(reader.result);
        // 将byteArray上传至服务器
        console.log(byteArray)
        postStreamListAudio(byteArray);
      });

      reader.readAsArrayBuffer(file);
    });
  }, [])

  const renderHeader = () => {
    return (
      <div className='header_button'>
        <div
          className="copy_all_button"
          style={{ color: "white" }}
          onClick={() => {
            let tmp = [];
            comments.map((item) => {
              tmp.push({
                role: 'user',
                content: item.name,
              })
              tmp.push({
                role: 'assistant',
                content: item.contents[0].text
              })
            })
            setJsonData(JSON.stringify(tmp));
            setOpen(true);
          }}>
          copy all
        </div>
        <input type="file" id="mp3-file"></input>
        <div
          className="copy_all_button"
          onClick={() => {
            setOpenMoreFunction(true);
          }}
          style={{ color: "white" }}
        >
          更多功能
        </div>
      </div>
    )
  }

  const renderDrawerCopyBtnAll = () => {
    return (
      <Drawer
        title={
          <div style={{ display: 'flex' }}>
            <div
              className='copy_button'
              id={"copyBtnAll"}
              data-clipboard-text={jsonData}
              onClick={(e) => {
                const clipboard = new ClipboardJS("#copyBtnAll");
                clipboard.on('success', () => {
                  messageApi.open({
                    key,
                    type: 'success',
                    content: '复制成功',
                    duration: 2
                  });
                });
              }}>copy</div>
            <div className='copy_button' onClick={() => {
              try {
                overWriteData(jsonData);
                setOpen(false);
              } catch (e) {
                messageApi.open({
                  key,
                  type: 'error',
                  content: 'json格式出错',
                  duration: 2
                });
              }
            }}>
              执行json
            </div>
            <div className='copy_button' onClick={() => {
              try {
                addLocalStorage(jsonData);
              } catch (e) {
                messageApi.open({
                  key,
                  type: 'error',
                  content: 'json格式出错',
                  duration: 2
                });
              }
            }}>
              缓存
            </div>
          </div>
        }
        placement={"bottom"}
        open={open}
        size='small'
        onClose={() => {
          setOpen(false)
        }}
      >
        <TextArea
          rows={4}
          value={jsonData}
          onChange={(e) => {
            setJsonData(e.target.value);
          }}
        />
      </Drawer>
    )
  }

  const renderDrawerMoreFunction = () => {
    return (
      <Drawer
        title={"更多功能"}
        placement={"bottom"}
        open={openMoreFunction}
        size='small'
        onClose={() => {
          setOpenMoreFunction(false)
        }}
      >
        <div>
          {
            !streaming ? (
              <button
                className="copy_all_button"
                onClick={() => {
                  comments = [];
                  setCount(0);
                }}>clear</button>
            ) : null
          }
          {
            <button
              className="copy_all_button"
              onClick={() => {
                clearLocalStorage();
                setCount(10);
              }}>clearStorage</button>
          }
          <div>
            <span>角色:</span>
            <Select
              style={{ width: '100%' }}
              defaultValue="origin"
              onChange={handleSelectChange}
              options={[
                { value: 'origin', label: 'origin' },
                ...Object.keys(roles).map((role) => ({ value: role, label: role }))
              ]}
            />
          </div>
          <div>
            <span>缓存:</span>
            <Select
              style={{ width: '100%' }}
              onChange={handleLocalDataChange}
            >
              {
                getLocalStorage().length ? getLocalStorage().map((item) => {
                  return <Option value={item.dataArr} key={Math.random()}>{item.time}</Option>
                }) : <Option value={"0"} key="无">无</Option>
              }
            </Select>
          </div>
        </div>
      </Drawer>
    )
  }

  const renderFrontPrompts = () => {
    if (frontPrompts && roles[frontPrompts]) {
      return <div className='frontPrompts'>前置指令：{roles[frontPrompts]()}</div>;
    } else {
      return null;
    }
  }

  const renderQuestion = () => {
    return (
      <div className='input_style'>
        <TextArea
          className='input_quertion'
          type="text"
          placeholder="请输入问题"
          value={question}
          name="question"
          onChange={handleForm}
          autoSize={{ minRows: 1, maxRows: 5 }}
        />
        <div style={{ width: '1vw' }}></div>
        <button onClick={() => {
          addStreamComment({
            isContinue: true,
            isCreate: false,
            question1: ""
          });
        }} className="confirm_button" >继续</button>
        <div style={{ width: '1vw' }}></div>
        <button onClick={() => {
          const pattern = /(http|https):\/\/([\w.]+\/?)\S*/;
          addStreamComment({ isCreate: true, isContinue: false, question1: "" });
        }} className="confirm_button" >提问</button>
      </div>
    )
  }

  return (
    <div className='app_container'>
      {renderHeader()}
      {renderFrontPrompts()}
      {renderList()}
      {contextHolder}
      {renderQuestion()}
      {renderDrawerCopyBtnAll()}
      {renderDrawerMoreFunction()}
    </div>
  )

}

const OmsSyntaxHighlight = (props) => {
  const { textContent, darkMode, language = 'txt' } = props;
  const [value, setValue] = useState(textContent);
  if (typeof darkMode === 'undefined') {
    them.light = darcula;
  }
  if (typeof darkMode === 'boolean') {
    them.light = coyWithoutShadows;
  }
  useEffect(() => {
    SyntaxHighlighter.registerLanguage("jsx", jsx);
    SyntaxHighlighter.registerLanguage("javascript", javascript);
    SyntaxHighlighter.registerLanguage("js", javascript);
  }, []);
  return (
    <ReactMarkdown source={value} escapeHtml={false} language={language}>{textContent}</ReactMarkdown>
  );
};
