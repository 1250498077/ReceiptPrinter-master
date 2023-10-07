

let self = {
  w1: generateNormalRandom(0, 1),
  w2: generateNormalRandom(0, 1),
  w3: generateNormalRandom(0, 1),
  w4: generateNormalRandom(0, 1),
  w5: generateNormalRandom(0, 1),
  w6: generateNormalRandom(0, 1),
  b1: generateNormalRandom(0, 1),
  b2: generateNormalRandom(0, 1),
  b3: generateNormalRandom(0, 1)
}

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}


function deriv_sigmoid(x) {
  let fx = sigmoid(x)
  return fx * (1 - fx)
}


function mse_loss(y_true, y_pred) {
  let totalNum = 0;
  y_true.map((item, index) => {
    totalNum = totalNum + Math.pow((y_true[index] - y_pred[index]), 2)
  });
  return totalNum / (y_true.length - 1)
}

// 生成权重随机数 - 符合高斯分布
function generateNormalRandom(mean, stddev) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random(); // 生成 (0,1) 之间的随机数
  while (v === 0) v = Math.random(); // 生成 (0,1) 之间的随机数

  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + stddev * z;
}


function feedforward(x) {
  let h1 = sigmoid(self.w1 * x[0] + self.w2 * x[1] + self.b1)
  let h2 = sigmoid(self.w3 * x[0] + self.w4 * x[1] + self.b2)
  let o1 = sigmoid(self.w5 * h1 + self.w6 * h2 + self.b3)
  return o1
}


function train(data, all_y_trues) {
  let learn_rate = 0.1;
  let epochs = 10;

  for (let j = 0; j < epochs; j++) {

    for (let i = 0; i < data.length; i++) {
      let x = data[i];
      let y_true = all_y_trues[i];

      let sum_h1 = self.w1 * x[0] + self.w2 * x[1] + self.b1
      let h1 = sigmoid(sum_h1)

      let sum_h2 = self.w3 * x[0] + self.w4 * x[1] + self.b2
      let h2 = sigmoid(sum_h2)

      let sum_o1 = self.w5 * h1 + self.w6 * h2 + self.b3
      let o1 = sigmoid(sum_o1)
      let y_pred = o1

      let d_L_d_ypred = -2 * (y_true - y_pred)

      let d_ypred_d_w5 = h1 * deriv_sigmoid(sum_o1)
      let d_ypred_d_w6 = h2 * deriv_sigmoid(sum_o1)
      let d_ypred_d_b3 = deriv_sigmoid(sum_o1)

      let d_ypred_d_h1 = self.w5 * deriv_sigmoid(sum_o1)
      let d_ypred_d_h2 = self.w6 * deriv_sigmoid(sum_o1)

      let d_h1_d_w1 = x[0] * deriv_sigmoid(sum_h1)
      let d_h1_d_w2 = x[1] * deriv_sigmoid(sum_h1)
      let d_h1_d_b1 = deriv_sigmoid(sum_h1)

      let d_h2_d_w3 = x[0] * deriv_sigmoid(sum_h2)
      let d_h2_d_w4 = x[1] * deriv_sigmoid(sum_h2)
      let d_h2_d_b2 = deriv_sigmoid(sum_h2)

      self.w1 -= learn_rate * d_L_d_ypred * d_ypred_d_h1 * d_h1_d_w1
      self.w2 -= learn_rate * d_L_d_ypred * d_ypred_d_h1 * d_h1_d_w2
      self.b1 -= learn_rate * d_L_d_ypred * d_ypred_d_h1 * d_h1_d_b1


      self.w3 -= learn_rate * d_L_d_ypred * d_ypred_d_h2 * d_h2_d_w3
      self.w4 -= learn_rate * d_L_d_ypred * d_ypred_d_h2 * d_h2_d_w4
      self.b2 -= learn_rate * d_L_d_ypred * d_ypred_d_h2 * d_h2_d_b2

      self.w5 -= learn_rate * d_L_d_ypred * d_ypred_d_w5
      self.w6 -= learn_rate * d_L_d_ypred * d_ypred_d_w6
      self.b3 -= learn_rate * d_L_d_ypred * d_ypred_d_b3


      if (j % 10 == 0) {
        let y_preds = data.map((item) => {
          return feedforward(item);
        });
        let loss = mse_loss(all_y_trues, y_preds);
        // 每10轮训练就打印一次均方误差
        console.log("loss:", loss);
      }
    }
  }
}

let data = [
  [-2, -1],
  [25, 6],
  [17, 4],
  [-15, -6],
]
let all_y_trues = [
  1,
  0,
  0,
  1,
]

train(data, all_y_trues);



export default {};