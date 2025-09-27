import nodemailer from "nodemailer";

export const mailSender = async(email, title, body) => {
    try{
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.user,
                pass: process.env.pass
            }
        })

        let info = await transporter.sendMail({
            from: `Network Next - by N Square`,
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`, 
        })
        
        return info;
    }catch(error){
        console.log(error.message);
    }
}