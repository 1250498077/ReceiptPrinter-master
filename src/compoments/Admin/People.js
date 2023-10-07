import axios from 'axios';
class People {
    constructor(name, age, gender, hometown, occupation) {
        this.name = name;
        this.age = age;
        this.gender = gender;
        this.hometown = hometown;
        this.occupation = occupation;
        this.list = [];
        this.addPerson({ name: "Cathy", age: 25, gender: "female", hometown: "Guangzhou", occupation: "teacher" });
        this.addPerson({ name: "David", age: 28, gender: "male", hometown: "Chengdu", occupation: "designer" });
        this.addPerson({ name: "Emily", age: 31, gender: "female", hometown: "Hangzhou", occupation: "writer" });
        this.addPerson({ name: "Frank", age: 37, gender: "male", hometown: "Suzhou", occupation: "entrepreneur" });
        this.addPerson({ name: "Alice", age: 23, gender: "female", hometown: "Beijing", occupation: "student" });
        this.addPerson({ name: "Bob", age: 30, gender: "male", hometown: "Shanghai", occupation: "engineer" });
        this.addPerson({ name: "George", age: 22, gender: "male", hometown: "Wuhan", occupation: "student" });
        this.addPerson({ name: "Helen", age: 29, gender: "female", hometown: "Tianjin", occupation: "doctor" });
        this.addPerson({ name: "Isaac", age: 27, gender: "male", hometown: "Xian", occupation: "researcher" });
        this.addPerson({ name: "Julia", age: 33, gender: "female", hometown: "Nanjing", occupation: "manager" });
        this.addPerson({ name: "Kevin", age: 26, gender: "male", hometown: "Chongqing", occupation: "teacher" });
        this.addPerson({ name: "Lily", age: 24, gender: "female", hometown: "Shenzhen", occupation: "engineer" });
        this.addPerson({ name: "Mike", age: 30, gender: "male", hometown: "Qingdao", occupation: "entrepreneur" });
        this.addPerson({ name: "Nancy", age: 28, gender: "female", hometown: "Zhengzhou", occupation: "designer" });
        this.addPerson({ name: "Oscar", age: 35, gender: "male", hometown: "Ningbo", occupation: "writer" });
        this.addPerson({ name: "Penny", age: 27, gender: "female", hometown: "Changsha", occupation: "student" });
        this.addPerson({ name: "Quincy", age: 29, gender: "male", hometown: "Fuzhou", occupation: "teacher" });
        this.addPerson({ name: "Rose", age: 32, gender: "female", hometown: "Shijiazhuang", occupation: "doctor" });
        this.addPerson({ name: "Simon", age: 36, gender: "male", hometown: "Wuxi", occupation: "researcher" });
        this.addPerson({ name: "Tina", age: 31, gender: "female", hometown: "Changchun", occupation: "manager" });
        this.addPerson({ name: "Vincent", age: 34, gender: "male", hometown: "Harbin", occupation: "designer" });
        this.addPerson({ name: "Wendy", age: 26, gender: "female", hometown: "Foshan", occupation: "manager" });
        this.addPerson({ name: "Xavier", age: 28, gender: "male", hometown: "Yangzhou", occupation: "entrepreneur" });
        this.addPerson({ name: "Yvonne", age: 33, gender: "female", hometown: "Jinan", occupation: "teacher" });
        this.addPerson({ name: "Zack", age: 30, gender: "male", hometown: "Zhuhai", occupation: "writer" });
        this.addPerson({ name: "Alice", age: 29, gender: "female", hometown: "Haikou", occupation: "doctor" });
    }


    addPerson(person) {
        this.list.push(person);
    }

    removePerson(person) {
        const index = this.list.findIndex((p) => p.name.toLowerCase() === person.name.toLowerCase());
        if (index !== -1) {
            this.list.splice(index, 1);
        }
    }

    findPerson(person) {
        if (person.name === "") {
            return this.list;
        }
        return this.list.filter((p) => p.name.toLowerCase() === person.name.toLowerCase());
    }

    updatePerson(person) {
        const index = this.list.findIndex((p) => p.name.toLowerCase() === person.name.toLowerCase());
        if (index !== -1) {
            this.list[index] = {
                ...this.list[index],
                ...person
            };
        }
    }

    updateAllPerson(attr, callback) {
        let arr = this.list.map((item) => {
            return {
                ...item,
                ...attr
            }
        });
        this.list = arr;
        console.log("arr", arr);
        if (callback) callback(arr);
    }

    getMemory() {
        return [
            {
                content: "我有一个系统处理人物信息 我有json格式数据是一个数组，数组每一项格式如：" +
                    "person: { \"name姓名\": \"Cathy\", \"age年龄\": 25, \"gender性别\": \"female\"," +
                    " \"hometown家乡\": \"Guangzhou\", \"occupation职业\": \"teacher\" }。" +
                    " 我有四个方法 addPerson(person)新增人物;removePerson(person)传入person对象 " +
                    "里面依据name删除人物;findPerson(person)根据persion对象的name查询人物;" +
                    "updatePerson(person)传入person对象里面根据name查询人物;updateAllPerson(person)传入属性，" +
                    "可以修改全部人的属性，例如传入{\"age\": 25},所有的人年龄都修改成25。" +
                    " 下面我给你指令，请你调用适当的方法，传入适当的参数帮助我操作系统。 例如：我说：帮我删除名字为david的人，" +
                    "你就返回指令：@{\"methods\":\"removePerson\",\"data\":{\"name\":\"david\"}}@;每条指令只能操作一个人物，" +
                    "你可以返回多条指令;是否明白",
                role: "user",
            },
            {
                content: "明白了。以下是根据您的指令给出的操作：帮我新增一个人，名字叫做Tom，年龄为30，性别为male，家乡为Shanghai，职业为engineer。" +
                    "返回指令：帮我新增一个人，名字叫做Tom，年龄为30，性别为male，家乡为Shanghai，职业为engineer。" +
                    "返回指令：@{\"methods\":\"addPerson\",\"data\":{\"name\":\"Tom\",\"age\":30,\"gender\":\"male\",\"hometown\":\"Shanghai\",\"occupation\":\"engineer\"}}@" +
                    "帮我删除名字为Cathy的人。" +
                    "返回指令：@{\"methods\":\"removePerson\",\"data\":{\"name\":\"Cathy\"}}@" +
                    "帮我查找名字为John的人。" +
                    "返回指令：@{\"methods\":\"findPerson\",\"data\":{\"name\":\"John\"}}@" +
                    "帮我更新名字为Lucy的人的信息，把家乡改为Beijing，职业改为doctor。" +
                    "返回指令：@{\"methods\":\"updatePerson\",\"data\":{\"name\":\"Lucy\",\"hometown\":\"Beijing\",\"occupation\":\"doctor\"}}@",
                role: "assistant"
            }
        ]
    }

    async toChatGPT(question, callback) {
        let str = await this.getList(question, callback);
        this.action(str, callback);
    }

    getList = (question, callback) => {
        return new Promise((resolve) => {
            axios.post('/search/send', {
                message: [
                    ...this.getMemory(),
                    {
                        content: question,
                        role: "user"
                    }
                ],
            }).then((response) => {
                // 请求成功
                resolve(response.data.choices[0].message.content);
            }).catch((error) => {
                // 请求失败，
                callback({
                    result: true,
                    response: "程序错误，请重新请求"
                });
                console.log(error);
            });
        })
    }

    action = (str, callback) => {
        const match = str.match(/@(.*?)@/g);
        console.log("match", match);
        if (match.length) {
            match.map((gptOrder) => {
                const match = gptOrder.match(/@(.*?)@/);
                const result = match ? match[1] : null;
                let json = JSON.parse(result);
                this[json.methods](json.data);
            });
            callback({
                result: true,
                response: "操作成功"
            });
        } else {

            callback({
                result: false,
                response: str
            });
        }
    }
}
export default People;