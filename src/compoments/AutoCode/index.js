
import React, { useContext, useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import { Space, Table, Drawer, Form, Input, Button, message } from 'antd';
const { Search } = Input;
const { TextArea } = Input;


const App = () => {
  const [textAreaValue, setTextAreaValue] = useState("帮我用java写一个简单的四则运算的计算器");
  const [messageApi, contextHolder] = message.useMessage();
  const key = 'updatable';
  const cmdRequest = (json) => {
    console.log("json", json)
    return new Promise((resolve) => {
      axios.post('/writeCode', {
        className: json.className,
        code: json.programString
      }).then((response) => {
        // 请求成功
        console.log("请求成功")
      })
    })
  }

  const getList = () => {
    return new Promise((resolve) => {
      axios.post('/writeCode', {
        message: [
          {
            content: `
              因为你只能生成代码，而不能执行代码，所以我写了个程序，功能是执行你返回的回答中存在的代码，所以我现
              在要训练你，程序的功能是截取你回答我的问题中的字符中识别其中的Java代码字符，放到文件当中，所以我需
              要java代码的文件名以及Java代码，Java代码文件名和类名一致，所以我需要你在java代码字符的开始和结束
              加上标记符号，如开始的时候加上@start，结束的时候加上@end，Java文件名前面加上，^结束加上^，后面你的
              任何一次回答中，都必须给代码块和文件名加上标记符号，因为我是程序识别的你的回答，不是人工，你回答不包
              含标记符号的话，我就无法识别code。${textAreaValue},按照给出的格式输出文件名和代码。
            `,
            role: "user"
          }
        ],
      }).then((response) => {
        // 请求成功
        resolve();
        let json = action(response.data.choices[0].message.content);
        cmdRequest(json);
      })
    })
  }

  const action = (str) => {
    var arr = str.split('^');
    var filename = arr[1].substring(0, arr[1].length);
    console.log("filename", filename)
    const index1 = str.indexOf('@start');
    const index2 = str.lastIndexOf('@end');
    let code = str.substring(index1 + 6, index2);
    let regex = /\^[^\^]+\^/g; // 匹配^及之间的字符
    code = code.replace(regex, ''); // 将匹配到的字符替换成^
    // code = code.replace(new RegExp("\^" + filename + "^", 'g'), "");
    console.log("code", code)
    messageApi.open({
      key,
      type: 'success',
      content: 'Waiting Application Open',
      duration: 30
    });
    return {
      className: filename,
      programString: code
    };
  }

  return (
    <div>
      {contextHolder}
      <div style={{ padding: 20 }}>
        <Button style={{ marginRight: 10 }} type="primary" onClick={() => {
          messageApi.open({
            key,
            type: 'loading',
            content: 'ChatGPT Loading ...',
            duration: 30
          });
          getList();
        }}>
          执行
        </Button>
        <div style={{ marginTop: 10 }}>
          <TextArea
            value={textAreaValue}
            placeholder='你可以要求chatgpt帮助你完成某些内容'
            onChange={(e) => {
              setTextAreaValue(e.target.value)
            }}
          />
        </div>
      </div>
    </div>
  )
}





export default App;