const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config();

let jwtBan = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IndoeWVsYWIiLCJpYXQiOjE2ODMzODM5NzAsImV4cCI6MTY4MzM4NzU3MCwianRpIjoiMTBjYjM4ZWMwZTlhNjllNzI2MDVlZmU0MDg0NmI4ZmEifQ.fqcGLlZ_mlW_wjFTKqJ4j2cYEPnFNUTpTa1IttSiCPg";

const jwtToken = jwt.verify(jwtBan, process.env.JWT_SECRET, { algorithms: ['HS256'], ignoreExpiration: false });

console.log(jwtToken.jti);
