import nodemailer from  'nodemailer'

const user = process.env.user;
const pass = process.env.pass;


  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user,
      pass:pass
    }});

  export default transporter;