import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import axios from 'axios';
import { AppService } from './app.service';
const Zlib = require('zlib');

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/pay')
  async getHello(@Query() params, @Res() res) {
    const { cardNumber, securityCode, expiryDate, moneyAmount } = params;

    const response = await axios({
      url: 'https://www.tinkoff.ru/api/common/v1/pay?appName=paymentsc2c&appVersion=2.9.6&origin=web%2Cib5%2Cplatform&sessionid=vxIe00DYSBU0k0cNLdGGxlf93BWGYplf.m1-prod-api58&wuid=c720689fdd3c6f0b1fc8fdaaa1c1fc72',
      params: {
        payParameters: {
          cardNumber,
          securityCode,
          expiryDate,
          moneyAmount,
          formProcessingTime: '699',
          attachCard: 'false',
          moneyCommission: '40',
          provider: 'c2c-anytoany',
          currency: 'RUB',
          providerFields: { toCardNumber: '2200700163855678' },
        },
      },
    });

    res.send(
      `<html>
        <body OnLoad="OnLoadEvent();">        
        <form name="mainform" action="${response.data.confirmationData['3DSecure'].url}" method="POST">
        <input type="hidden" name="PaReq" value="${response.data.confirmationData['3DSecure'].requestSecretCode}">
        <input type="hidden" name="TermUrl" value=${process.env.HOST}/confirm>
        <input type="hidden" name="MD" value="${response.data.confirmationData['3DSecure'].merchantData}"> 
        </form>
        <SCRIPT LANGUAGE="Javascript">
          function OnLoadEvent() {
      document.mainform.submit();} 
        </SCRIPT>
      </body>
        </html>`,
    );
  }

  @Post('/confirm')
  async confirmPayment(@Body() params, @Res() res) {
    if (!params.PaRes) res.status(400).send('wrong params');

    const inflated = Zlib.inflateSync(
      Buffer.from(params.PaRes, 'base64'),
    ).toString();
    const isSuccessPayment = inflated.includes('<status>Y</status>');
    const response = isSuccessPayment ? 'suceess' : 'error';

    res.send(response);
    res.end();
  }
}
