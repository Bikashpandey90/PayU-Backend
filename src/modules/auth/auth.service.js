const brcypt = require("bcryptjs");
const fileUploaderSvc = require("../../services/fileuploader.service");
const { randomStringGenerator } = require("../../utilities/helpers");
const UserModel = require("../user.model");
const emailSvc = require("../../services/mail.service");
class AuthService {
  transformUserRegister = async (req) => {
    try {
      let data = req.body;
      //password
      const salt = brcypt.genSaltSync(10);
      data.password = brcypt.hashSync(data.password, salt);
      delete data.confirmPassword;

      // brcypt.compareSync("Admin123#",data.password);

      let file = req.file; //single upload

      if (file) {
        data.image = await fileUploaderSvc.uploadFile(file.path, "/users");
      }

      data.otp = randomStringGenerator(6, false);
      data.otpExpiryTime = new Date(Date.now() + 300000);
      data.status = "inactive";

      return data;
    } catch (exception) {
      console.log(exception);
      throw exception;
    }
  };

  createUser = async (data) => {
    try {
      const userObj = new UserModel(data);
      return await userObj.save();
    } catch (exception) {
      console.log("Create user", exception);
      throw exception;
    }
  };
  sendActivationNotification = async (name, otp, email) => {
    try {
      let msg = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bikash Pandey</title>
  </head>
  <body style="margin: 0; padding: 0; background: #000000">
    <center>
      <table
        role="presentation"
        cellpadding="0"
        cellspacing="0"
        width="100%"
        bgcolor="white"
      >
        <tr>
          <td align="center">
            <table
              role="presentation"
              cellpadding="0"
              cellspacing="0"
              width="740"
              style="width: 100%; max-width: 740px; background: #f2ebe5"
            >
              <!-- HERO -->
              <tr>
                <td
                  align="center"
                  style="
                    background: #f2ebe5;
                    padding: 40px 24px 0;
                    font-family: Arial, Helvetica, sans-serif;
                  "
                >
                  <!-- Logo -->
                  <table
                    role="presentation"
                    width="100%"
                    cellspacing="0"
                    cellpadding="0"
                  >
                    <tr>
                      <td align="left" valign="top">
                        <img
                          src="https://res.cloudinary.com/dwtbzhlph/image/upload/v1782755547/Untitled_-_June_28_2026_at_23.10.22_1_pcpof3.png"
                          width="82"
                          alt="BP"
                          style="
                            display: block;
                            border: 0;
                            outline: none;
                            text-decoration: none;
                          "
                        />
                        <td align="left" valign="bottom" style="background:black">

                        </td>
                      </td>

                      <td align="right" valign="top">
                        <!-- CTA -->
                    <table
  role="presentation"
  cellspacing="0"
  cellpadding="0"
  border="0"
  style="background:#FFFFFF;border-radius:999px;"
>
  <tr>
    <td
      style="
        padding:0 28px;
        height:56px;
        font-family:Arial,Helvetica,sans-serif;
        font-size:20px;
        line-height:20px;
        color:#000000;
        white-space:nowrap;
      "
    >
      <a href="#" style="color:#000000;text-decoration:none;line-height:56px;display:block;">
        View Portfolio
      </a>
    </td>

    <td style="padding-right:5px;">
      <table
        role="presentation"
        cellpadding="0"
        cellspacing="0"
        width="46"
        height="46"
        style="background:#D9D9D9;border-radius:50%;"
      >
        <tr>
        <td align="center" valign="middle">
    <img
        src="https://res.cloudinary.com/dwtbzhlph/image/upload/v1783775235/arrow-up-right_1_ynexfb.png"
        width="28"
        height="28"
        alt=""
        style="display:block;border:0;"
    >
</td>
        </tr>
      </table>
    </td>
  </tr>
</table>
                      </td>
                    </tr>
                  </table>

                  <!-- Portrait -->
                  <table
                    role="presentation"
                    cellspacing="0"
                    cellpadding="0"
                    width="100%"
                  >
                    <tr>
                      <td align="center">
                        <img
                          src="https://res.cloudinary.com/dwtbzhlph/image/upload/v1782755494/ChatGPT_Image_Jun_28_2026_09_58_47_PM_ifadpe.png"
                          width="720"
                          alt="Bikash Pandey"
                          style="
                            display: block;
                            width: 100%;
                            max-width: 720px;
                            object-fit: cover;
                            border: 0;
                            mix-blend-mode: darken;
                          "
                        />
                      </td>
                    </tr>
                  </table>



                  <!-- Heading -->
<table
  role="presentation"
  width="100%"
  cellspacing="0"
  cellpadding="0"
  style="background:#F2EBE5;"
>
  <tr>
    <td
      align="center"
      style="
        padding:24px 20px 28px;
        font-family:Arial,Helvetica,sans-serif;
      "
    >
      <div
        style="
          font-size:48px;
          line-height:48px;
          font-weight:400;
          color:#353535;
        "
      >
        Creative | Full-stack<br />
        Developer
      </div>
    </td>
  </tr>

  <!-- CTA Button -->
  <tr>
    <td align="center" style="padding:0 20px 70px;">
      <table
        role="presentation"
        cellspacing="0"
        cellpadding="0"
        border="0"
        style="
          background:#FFFFFF;
          border-radius:999px;
        "
      >
        <tr>
          <td
            style="
              padding:0 38px;
              height:60px;
              font-family:Arial,Helvetica,sans-serif;
              font-size:22px;
              color:#000000;
              white-space:nowrap;
            "
          >
            <a
              href="#"
              style="
                color:#000000;
                text-decoration:none;
                display:block;
                line-height:60px;
              "
            >
              View Portfolio
            </a>
          </td>

          <td style="padding-right:7px;">
            <table
              role="presentation"
              cellspacing="0"
              cellpadding="0"
              width="50"
              height="50"
              style="
                background:#D8D8D8;
                border-radius:50%;
              "
            >
              <tr>
                <td align="center" valign="middle">
                  <img
                    src="https://res.cloudinary.com/dwtbzhlph/image/upload/v1783775235/arrow-up-right_1_ynexfb.png"
                    width="28"
                    height="28"
                    alt=""
                    style="display:block;border:0;"
                  />
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
                </td>

                
              </tr>
              

              <!-- ========================= -->
              <!-- ABOUT / INTRO SECTION -->
              <!-- ========================= -->

              <tr>
                <td
                  align="center"
                  bgcolor="#f2ebe5"
                  style="padding: 70px 30px 0"
                >
                  <!-- SMALL LABEL -->

                  <div
                    style="
                      font-family: Arial, Helvetica, sans-serif;
                      font-size: 30px;
                      letter-spacing: 14px;
                      color: #b8aea8;
                      line-height: 38px;
                    "
                  >
                  HI, MYSELF
                  </div>

                  <!-- NAME -->

                  <div
                    style="
                      font-family: Arial, Helvetica, sans-serif;
                      font-size: 100px;
                      line-height: 92px;
                      font-weight: 700;
                      color: #b6aca6;
                      padding-top: 6px;
                    "
                  >
                    BIKASH
                  </div>
                </td>
              </tr>

              <!-- DESCRIPTION -->

              <tr>
                <td
                  align="center"
                  bgcolor="#f2ebe5"
                  style="
                    padding: 35px 40px 55px;
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 28px;
                    line-height: 46px;
                    color: #353535;
                  "
                >
                 
                  I build modern, high-performance<br/>
                  web experiences with clean code<br/>
                   and pixel-perfect design.
                </td>
              </tr>

              <!-- FEATURE CARDS -->

              <tr>
                <td
                  align="center"
                  bgcolor="#f2ebe5"
                  style="padding: 0 20px 80px"
                >
                  <table
                    role="presentation"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                  >
                    <tr>
                      <!-- CARD 1 -->

                      <td align="center" valign="top" style="padding: 0 10px">
                        <table
                          role="presentation"
                          cellpadding="0"
                          cellspacing="0"
                          width="170"
                          style="
                            background: #f7f5f2;
                            border: 1px solid #ffffff;
                            border-radius: 22px;
                          "
                        >
                          <tr>
                            <td align="center" style="padding: 28px 20px 18px">
                              <img
                                src="https://res.cloudinary.com/dwtbzhlph/image/upload/v1783853412/animate_gvz2jw.png"
                                width="52"
                                style="display: block; border: 0"
                                alt=""
                              />
                            </td>
                          </tr>

                          <tr>
                            <td
                              align="center"
                              style="
                                padding: 0 18px 30px;
                                font-family: Arial, Helvetica, sans-serif;
                                font-size: 24px;
                                font-weight: 600;
                                line-height: 34px;
                                color: #353535;
                              "
                            >
                              25+<br/>
                              PROJECTS
                            </td>
                          </tr>
                        </table>
                      </td>

                      <!-- CARD 2 -->

                      <td align="center" valign="top" style="padding: 0 10px">
                        <table
                          role="presentation"
                          cellpadding="0"
                          cellspacing="0"
                          width="170"
                          style="
                            background: #f7f5f2;
                            border: 1px solid #ffffff;
                            border-radius: 22px;
                          "
                        >
                          <tr>
                            <td align="center" style="padding: 28px 20px 18px">
                              <img
                                src="https://res.cloudinary.com/dwtbzhlph/image/upload/v1783853412/software-developer_h1d9yh.png"
                                width="52"
                                style="display: block; border: 0"
                                alt=""
                              />
                            </td>
                          </tr>

                          <tr>
                            <td
                              align="center"
                              style="
                                padding: 0 18px 30px;
                                font-family: Arial, Helvetica, sans-serif;
                                font-size: 24px;
                                font-weight: 600;
                                line-height: 34px;
                                color: #353535;
                              "
                            >
                              FULL<br />
                              STACK
                            </td>
                          </tr>
                        </table>
                      </td>

                      <!-- CARD 3 -->

                      <td align="center" valign="top" style="padding: 0 10px">
                        <table
                          role="presentation"
                          cellpadding="0"
                          cellspacing="0"
                          width="170"
                          style="
                            background: #f7f5f2;
                            border: 1px solid #ffffff;
                            border-radius: 22px;
                          "
                        >
                          <tr>
                            <td align="center" style="padding: 28px 20px 18px">
                              <img
                                src="https://res.cloudinary.com/dwtbzhlph/image/upload/v1783853412/expertise_vh2bsc.png"
                                width="52"
                                style="display: block; border: 0"
                                alt=""
                              />
                            </td>
                          </tr>

                          <tr>
                            <td
                              align="center"
                              style="
                                padding: 0 18px 30px;
                                font-family: Arial, Helvetica, sans-serif;
                                font-size: 24px;
                                font-weight: 600;
                                line-height: 34px;
                                color: #353535;
                              "
                            >
                              1yr+<br />
                              EXPERIENCE
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- LETTER -->

              <tr>
                <td
                  bgcolor="#f2ebe5"
                  style="
                    padding: 50px 60px 80px;
                    font-family: Arial, Helvetica, sans-serif;
                    color: #343434;
                  "
                >
                  <div
                    style="
                      font-size: 32px;
                      line-height: 46px;
                      font-weight: 400;
                      padding-bottom: 40px;
                    "
                  >
                    Dear Hiring Team,
                  </div>

                  <div
                    style="font-size: 30px; line-height: 52px; font-weight: 400"
                  >
                    I am writing to express my interest about the Full-Stack
                    Developer position at your company. Let my works speak
                    before me.
                  </div>
                </td>
              </tr>

              <!-- ====================================== -->
              <!-- FEATURED WORKS -->
              <!-- ====================================== -->

              <tr>
                <td
                  align="center"
                  bgcolor="#f2ebe5"
                  style="padding: 80px 30px 0"
                >
                  <!-- Heading -->

                  <div
                    style="
                      font-family: Arial, Helvetica, sans-serif;
                      font-size: 28px;
                      letter-spacing: 12px;
                      color: #b8aea8;
                    "
                  >
                    MY FEATURED
                  </div>

                  <div
                    style="
                      font-family: Arial, Helvetica, sans-serif;
                      font-size: 92px;
                      line-height: 84px;
                      font-weight: 700;
                      color: #b7ada7;
                      padding-top: 6px;
                    "
                  >
                    WORKS
                  </div>
                </td>
              </tr>

              <!-- ======================= -->
              <!-- Project 01 -->
              <!-- ======================= -->

              
           <tr>
  <td align="right" bgcolor="#f2ebe5" style="padding:55px 0 0 0;">

    <table
      role="presentation"
      width="90%"
    
      
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="
        background:#6C748D;
        border-radius:24px 0 0 24px;
      "
    >
      <tr>

        <!-- LEFT CONTENT -->
        <td
          width="45%"
          valign="middle"
          style="
            padding:0px 35px;
            font-family:Arial,Helvetica,sans-serif;
            color:#ffffff;
          "
        >

          <div
            style="
              font-size:18px;
              letter-spacing:5px;
              color:#D9DCE6;
              margin-top:30px;
              margin-bottom:4px;
            "
          >
            ///
          </div>

          <div
            style="
              font-size:28px;
              line-height:50px;
              font-weight:bold;
              color:#ffffff;
            "
          >
            Igloo Inc Clone
          </div>

          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            style="margin:4px 0 4px 0;"
          >
            <tr>
              <td
                style="
                  width:200px;
                  border-top:1px solid #ffffff;
                  height:1px;
                  font-size:0;
                  line-height:0;
                "
              >
                &nbsp;
              </td>
            </tr>
          </table>

          <div
            style="
              font-size:16px;
              line-height:32px;
              color:#E8EBF4;
              margin-bottom:10px;
            "
          >
            Awwward winning website ✦
          </div>

          <!-- BUTTON -->
          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            style="margin-bottom:20px;"
          >
            <tr>
              <td
                bgcolor="#FFFFFF"
                style="
                  border-radius:40px;
                "
              >
                <a
                  href="https://yourportfolio.com/project-1"
                  style="
                    display:inline-block;
                    padding:10px 24px;
                    font-size:16px;
                    font-weight:600;
                    color:#31384B;
                    text-decoration:none;
                    font-family:Arial,Helvetica,sans-serif;
                  "
                >
                  View Project ↗
                </a>
              </td>
            </tr>
          </table>

        </td>

        <!-- RIGHT IMAGE -->
        <td
          width="55%"
          align="right"
          valign="bottom"
        >
          <a href="https://yourportfolio.com/project-1">
            <img
              src="https://res.cloudinary.com/dwtbzhlph/image/upload/v1783778114/f6ebd895-5ac3-4a6c-94bd-b93bdcd32ad4_iwoe1y.png"
              width="630"
              height="280"
              alt="Igloo Clone"
              style="
                display:block;
                width:100%;
                max-width:530px;
                border:0;
                margin-top:-120px;
              "
            >
          </a>
        </td>

      </tr>
    </table>

  </td>
</tr>

              <!-- ======================= -->
              <!-- Project 02 -->
              <!-- ======================= -->

                        <tr>
  <td align="left" bgcolor="#f2ebe5" style="padding:55px 0 0 0;">

    <table
      role="presentation"
      width="90%"
    
      
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="
        background:#E29FA6;
        border-radius:0 24px 24px 0;
      "
    >
      <tr>

        <!-- LEFT CONTENT -->
       

        <!-- RIGHT IMAGE -->
        <td
          width="55%"
          align="right"
          valign="bottom"
        >
          <a href="https://yourportfolio.com/project-1">
            <img
              src="https://res.cloudinary.com/dwtbzhlph/image/upload/v1783778065/ChatGPT_Image_Jul_11_2026_05_43_55_PM_eozslm.png"
              width="630"
             
              alt="Igloo Clone"
              style="
                display:block;
                width:100%;
                max-width:530px;
                border:0;
                margin-top:-120px;
              "
            >
          </a>
        </td>

         <td
          width="45%"
          valign="middle"
          style="
            padding:0px 35px;
            font-family:Arial,Helvetica,sans-serif;
            color:#ffffff;
          "
        >

          <div
            style="
              font-size:18px;
              letter-spacing:5px;
              color:#D9DCE6;
              margin-top:30px;
              margin-bottom:4px;
            "
          >
            ///
          </div>

          <div
            style="
              font-size:28px;
              line-height:50px;
              font-weight:bold;
              color:#ffffff;
            "
          >
            Truekind Clone
          </div>

          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            style="margin:4px 0 4px 0;"
          >
            <tr>
              <td
                style="
                  width:200px;
                  border-top:1px solid #ffffff;
                  height:1px;
                  font-size:0;
                  line-height:0;
                "
              >
                &nbsp;
              </td>
            </tr>
          </table>

          <div
            style="
              font-size:16px;
              line-height:32px;
              color:#E8EBF4;
              margin-bottom:10px;
            "
          >
            Awwward winning website ✦
          </div>

          <!-- BUTTON -->
          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            style="margin-bottom:20px;"
          >
            <tr>
              <td
                bgcolor="#FFFFFF"
                style="
                  border-radius:40px;
                "
              >
                <a
                  href="https://yourportfolio.com/project-1"
                  style="
                    display:inline-block;
                    padding:10px 24px;
                    font-size:16px;
                    font-weight:600;
                    color:#31384B;
                    text-decoration:none;
                    font-family:Arial,Helvetica,sans-serif;
                  "
                >
                  View Project ↗
                </a>
              </td>
            </tr>
          </table>

        </td>

      </tr>
    </table>

  </td>
</tr>

              <!-- ======================= -->
              <!-- Project 03 -->
              <!-- ======================= -->
           <tr>
  <td align="right" bgcolor="#f2ebe5" style="padding:55px 0 0 0;">

    <table
      role="presentation"
      width="90%"
    
      
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="
        background:#6C748D;
        border-radius:24px 0 0 24px;
      "
    >
      <tr>

        <!-- LEFT CONTENT -->
        <td
          width="45%"
          valign="middle"
          style="
            padding:0px 35px;
            font-family:Arial,Helvetica,sans-serif;
            color:#ffffff;
          "
        >

          <div
            style="
              font-size:18px;
              letter-spacing:5px;
              color:#D9DCE6;
              margin-top:30px;
              margin-bottom:4px;
            "
          >
            ///
          </div>

          <div
            style="
              font-size:28px;
              line-height:50px;
              font-weight:bold;
              color:#ffffff;
            "
          >
            PAYU
          </div>

          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            style="margin:4px 0 4px 0;"
          >
            <tr>
              <td
                style="
                  width:200px;
                  border-top:1px solid #ffffff;
                  height:1px;
                  font-size:0;
                  line-height:0;
                "
              >
                &nbsp;
              </td>
            </tr>
          </table>

          <div
            style="
              font-size:16px;
              line-height:32px;
              color:#E8EBF4;
              margin-bottom:10px;
            "
          >
          Fullstack Ewallet WebApp ✦
          </div>

          <!-- BUTTON -->
          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            style="margin-bottom:20px;"
          >
            <tr>
              <td
                bgcolor="#FFFFFF"
                style="
                  border-radius:40px;
                "
              >
                <a
                  href="https://yourportfolio.com/project-1"
                  style="
                    display:inline-block;
                    padding:10px 24px;
                    font-size:16px;
                    font-weight:600;
                    color:#31384B;
                    text-decoration:none;
                    font-family:Arial,Helvetica,sans-serif;
                  "
                >
                  View Project ↗
                </a>
              </td>
            </tr>
          </table>

        </td>

        <!-- RIGHT IMAGE -->
        <td
          width="55%"
          align="right"
          valign="bottom"
        >
          <a href="https://yourportfolio.com/project-1">
            <img
              src="https://res.cloudinary.com/dwtbzhlph/image/upload/v1783778114/f6ebd895-5ac3-4a6c-94bd-b93bdcd32ad4_iwoe1y.png"
              width="630"
              height="280"
              alt="Igloo Clone"
              style="
                display:block;
                width:100%;
                max-width:530px;
                border:0;
                margin-top:-120px;
              "
            >
          </a>
        </td>

      </tr>
    </table>

  </td>
</tr>

              <!-- ======================= -->
              <!-- Project 04 -->
              <!-- ======================= -->

                 <tr>
  <td align="left" bgcolor="#f2ebe5" style="padding:55px 0 0 0;">

    <table
      role="presentation"
      width="90%"
    
      
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="
        background:#C6D2F1;
        border-radius: 0 24px 24px 0;
      "
    >
      <tr>
           <td
          width="55%"
          align="right"
          valign="bottom"
        >
          <a href="https://yourportfolio.com/project-1">
            <img
              src="https://res.cloudinary.com/dwtbzhlph/image/upload/v1783778061/ChatGPT_Image_Jul_11_2026_05_51_15_PM_zw2bnv.png"
              width="630"
              height="280"
              alt="Igloo Clone"
              style="
                display:block;
                width:100%;
                max-width:530px;
                border:0;
                margin-top:-120px;
              "
            >
          </a>
        </td>

        <!-- LEFT CONTENT -->
        <td
          width="45%"
          valign="middle"
          style="
            padding:0px 35px;
            font-family:Arial,Helvetica,sans-serif;
            color:#ffffff;
          "
        >

          <div
            style="
              font-size:18px;
              letter-spacing:5px;
              color:#D9DCE6;
              margin-top:30px;
              margin-bottom:4px;
            "
          >
            ///
          </div>

          <div
            style="
              font-size:28px;
              line-height:50px;
              font-weight:bold;
              color:#ffffff;
            "
          >
            RideX
          </div>

          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            style="margin:4px 0 4px 0;"
          >
            <tr>
              <td
                style="
                  width:200px;
                  border-top:1px solid #ffffff;
                  height:1px;
                  font-size:0;
                  line-height:0;
                "
              >
                &nbsp;
              </td>
            </tr>
          </table>

          <div
            style="
              font-size:16px;
              line-height:32px;
              color:#E8EBF4;
              margin-bottom:10px;
            "
          >
            Fullstack RideHailing App ✦
          </div>

          <!-- BUTTON -->
          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            style="margin-bottom:20px;"
          >
            <tr>
              <td
                bgcolor="#FFFFFF"
                style="
                  border-radius:40px;
                "
              >
                <a
                  href="https://yourportfolio.com/project-1"
                  style="
                    display:inline-block;
                    padding:10px 24px;
                    font-size:16px;
                    font-weight:600;
                    color:#C6D2F1;
                    text-decoration:none;
                    font-family:Arial,Helvetica,sans-serif;
                  "
                >
                  View Project ↗
                </a>
              </td>
            </tr>
          </table>

        </td>

        <!-- RIGHT IMAGE -->
     

      </tr>
    </table>

  </td>
</tr>

              <!-- ======================= -->
              <!-- CTA -->
              <!-- ======================= -->

              <tr>
                <td
                  align="center"
                  bgcolor="#f2ebe5"
                  style="padding: 70px 0 90px"
                >
                   <table
  role="presentation"
  cellspacing="0"
  cellpadding="0"
  border="0"
  style="background:#FFFFFF;border-radius:999px;"
>
  <tr>
    <td
      style="
        padding:0 28px;
        height:56px;
        font-family:Arial,Helvetica,sans-serif;
        font-size:20px;
        line-height:20px;
        color:#000000;
        white-space:nowrap;
      "
    >
      <a href="#" style="color:#000000;text-decoration:none;line-height:56px;display:block;">
        Explore More
      </a>
    </td>

    <td style="padding-right:5px;">
      <table
        role="presentation"
        cellpadding="0"
        cellspacing="0"
        width="46"
        height="46"
        style="background:#D9D9D9;border-radius:50%;"
      >
        <tr>
        <td align="center" valign="middle">
    <img
        src="https://res.cloudinary.com/dwtbzhlph/image/upload/v1783775235/arrow-up-right_1_ynexfb.png"
        width="28"
        height="28"
        alt=""
        style="display:block;border:0;"
    >
</td>
        </tr>
      </table>
    </td>
  </tr>
</table>
                </td>
              </tr>

              <!-- ====================================== -->
              <!-- EXPERIENCE & SKILLS -->
              <!-- ====================================== -->

              <tr>
                <td
                  align="center"
                  bgcolor="#f2ebe5"
                  style="padding: 90px 30px 0"
                >
                  <!-- Small Heading -->

                  <div
                    style="
                      font-family: Arial, Helvetica, sans-serif;
                      font-size: 24px;
                      letter-spacing: 12px;
                      color: #b8aea8;
                    "
                  >
                    EXPERIENCE &
                  </div>

                  <!-- Large Heading -->

                  <div
                    style="
                      font-family: Arial, Helvetica, sans-serif;
                      font-size: 92px;
                      line-height: 86px;
                      font-weight: 700;
                      color: #b7ada7;
                      padding-top: 8px;
                    "
                  >
                    SKILLS
                  </div>
                </td>
              </tr>

              <!-- ====================================== -->
              <!-- EXPERIENCE CARD -->
              <!-- ====================================== -->

              <tr>
                <td
                  align="center"
                  bgcolor="#f2ebe5"
                  style="padding: 55px 30px 70px"
                >
                  <table
                    role="presentation"
                    cellpadding="0"
                    cellspacing="0"
                    width="100%"
                    style="
                      max-width: 640px;
                      background: #f7f5f2;
                      border: 1px solid #ffffff;
                      border-radius: 26px;
                    "
                  >
                    <tr>
                      <td
                        style="
                          padding: 42px 42px 28px;
                          font-family: Arial, Helvetica, sans-serif;
                        "
                      >
                        <table
                          role="presentation"
                          width="100%"
                          cellpadding="0"
                          cellspacing="0"
                        >
                          <tr>
                            <!-- Left -->

                            <td width="70%" valign="top">
                              <div
                                style="
                                  font-size: 58px;
                                  line-height: 60px;
                                  color: #444444;
                                  font-weight: 400;
                                "
                              >
                                Full-Stack<br />
                                Developer
                              </div>

                              <div
                                style="
                                  padding-top: 34px;
                                  font-size: 26px;
                                  line-height: 34px;
                                  color: #5b5b5b;
                                "
                              >
                                Technergy Global Pvt. Ltd.
                              </div>
                            </td>

                            <!-- Right -->

                            <td width="45%" align="right" valign="top">
                              <div
                                style="
                                  font-size: 24px;
                                  line-height: 34px;
                                  color: #444444;
                                "
                              >
                                Nov 2025 – Jun 2026
                              </div>

                              <div
                                style="
                                  padding-top: 12px;
                                  font-size: 24px;
                                  line-height: 34px;
                                  color: #444444;
                                "
                              >
                                Hybrid
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- ====================================== -->
              <!-- SKILLS IMAGE -->
              <!-- ====================================== -->

              <tr>
                <td align="center" bgcolor="#f2ebe5" style="padding: 0 0 70px">
                  <img
                    src="https://res.cloudinary.com/dwtbzhlph/image/upload/v1783773560/newSkills_lwwxfy.png"
                    width="700"
                    alt="Technologies"
                    style="
                      display: block;
                      width: 100%;
                      max-width: 700px;
                      border: 0;
                      outline: none;
                      text-decoration: none;
                      mix-blend-mode: multiply;
                    "
                  />
                </td>
              </tr>

              <!-- ====================================== -->
              <!-- RESUME BUTTON -->
              <!-- ====================================== -->

              <tr>
                <td align="center" bgcolor="#f2ebe5" style="padding: 0 0 100px">
                  <table
  role="presentation"
  cellspacing="0"
  cellpadding="0"
  border="0"
  style="background:#FFFFFF;border-radius:999px;"
>
  <tr>
    <td
      style="
        padding:0 28px;
        height:56px;
        font-family:Arial,Helvetica,sans-serif;
        font-size:20px;
        line-height:20px;
        color:#000000;
        white-space:nowrap;
      "
    >
      <a href="#" style="color:#000000;text-decoration:none;line-height:56px;display:block;">
        View Resume
      </a>
    </td>

    <td style="padding-right:5px;">
      <table
        role="presentation"
        cellpadding="0"
        cellspacing="0"
        width="46"
        height="46"
        style="background:#D9D9D9;border-radius:50%;"
      >
        <tr>
        <td align="center" valign="middle">
    <img
        src="https://res.cloudinary.com/dwtbzhlph/image/upload/v1783775235/arrow-up-right_1_ynexfb.png"
        width="28"
        height="28"
        alt=""
        style="display:block;border:0;"
    >
</td>
        </tr>
      </table>
    </td>
  </tr>
</table>
                </td>
              </tr>

              <!-- ====================================== -->
              <!-- WHY WOULD I FIT IN -->
              <!-- ====================================== -->

              <tr>
                <td
                  align="center"
                  bgcolor="#f2ebe5"
                  style="padding: 90px 30px 0"
                >
                  <div
                    style="
                      font-family: Arial, Helvetica, sans-serif;
                      font-size: 24px;
                      letter-spacing: 12px;
                      color: #b8aea8;
                    "
                  >
                    WHY WOULD I
                  </div>

                  <div
                    style="
                      font-family: Arial, Helvetica, sans-serif;
                      font-size: 102px;
                      line-height: 74px;
                      font-weight: 700;
                      color: #b7ada7;
                      padding-top: 8px;
                    "
                  >
                    FIT IN
                  </div>
                </td>
              </tr>

              <!-- ====================================== -->
              <!-- FEATURE 1 -->
              <!-- ====================================== -->

              <tr>
                <td bgcolor="#f2ebe5" style="padding: 55px 50px 0">
                  <table
                    role="presentation"
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                  >
                    <tr>

                        <td align="center" valign="top" style="padding: 0 10px">
                        <table
                          role="presentation"
                          cellpadding="0"
                          cellspacing="0"
                          width="150"
                          height="150"
                          style="
                            background: #f7f5f2;
                            border: 1px solid #ffffff;
                            border-radius: 22px;
                          "
                        >
                          <tr>
                            <td align="center" style="padding: 28px 20px 18px">
                              <img
                          src="https://res.cloudinary.com/dwtbzhlph/image/upload/v1783854051/problem-solving_yg4hbs.png"
                          width="80"
                          style="display: block; border: 0"
                          alt="Problem Solving"
                        />
                            </td>
                          </tr>

                        </table>
                      </td>

                      <td valign="top" style="padding-left: 30px">
                        <div
                          style="
                            font-family: Arial, Helvetica, sans-serif;
                            font-size: 30px;
                            font-weight: 700;
                            color: #4a4a4a;
                            padding-bottom: 18px;
                          "
                        >
                          PROBLEM SOLVING
                        </div>

                        <div
                          style="
                            font-family: Arial, Helvetica, sans-serif;
                            font-size: 18px;
                            line-height: 30px;
                            color: #666666;
                          "
                        >
                          I focus on identifying pain points and turning them
                          into simple, effective design solutions.
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- ====================================== -->
              <!-- FEATURE 2 -->
              <!-- ====================================== -->

              <tr>
                <td bgcolor="#f2ebe5" style="padding: 35px 50px 0">
                  <table
                    role="presentation"
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                  >
                    <tr>
                      <td align="center" valign="top" style="padding: 0 10px">
                        <table
                          role="presentation"
                          cellpadding="0"
                          cellspacing="0"
                          width="150"
                          height="150"
                          style="
                            background: #f7f5f2;
                            border: 1px solid #ffffff;
                            border-radius: 22px;
                          "
                        >
                          <tr>
                            <td align="center" style="padding: 28px 20px 18px">
                              <img
                          src="https://res.cloudinary.com/dwtbzhlph/image/upload/v1783854051/responsive_tc48u7.png"

                          width="80"
                          style="display: block; border: 0"
                          alt="Problem Solving"
                        />
                            </td>
                          </tr>

                        </table>
                      </td>

                      <td valign="top" style="padding-left: 30px">
                        <div
                          style="
                            font-family: Arial, Helvetica, sans-serif;
                            font-size: 30px;
                            font-weight: 700;
                            color: #4a4a4a;
                            padding-bottom: 18px;
                          "
                        >
                          MODERN UI DESIGN
                        </div>

                        <div
                          style="
                            font-family: Arial, Helvetica, sans-serif;
                            font-size: 18px;
                            line-height: 30px;
                            color: #666666;
                          "
                        >
                          I create visually appealing, responsive interfaces
                          with consistency and strong brand identity.
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- ====================================== -->
              <!-- FEATURE 3 -->
              <!-- ====================================== -->

              <tr>
                <td bgcolor="#f2ebe5" style="padding: 35px 50px 0">
                  <table
                    role="presentation"
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                  >
                    <tr>
                     
                      
                        <td align="center" valign="top" style="padding: 0 10px">
                        <table
                          role="presentation"
                          cellpadding="0"
                          cellspacing="0"
                          width="150"
                          height="150"
                          style="
                            background: #f7f5f2;
                            border: 1px solid #ffffff;
                            border-radius: 22px;
                          "
                        >
                          <tr>
                            <td align="center" style="padding: 28px 20px 18px">
                              <img
                          src="https://res.cloudinary.com/dwtbzhlph/image/upload/v1783854051/machine-learning_uz6jya.png"

                          width="80"
                          style="display: block; border: 0"
                          alt="Problem Solving"
                        />
                            </td>
                          </tr>

                        </table>
                      </td>

                      <td valign="top" style="padding-left: 30px">
                        <div
                          style="
                            font-family: Arial, Helvetica, sans-serif;
                            font-size: 30px;
                            font-weight: 700;
                            color: #4a4a4a;
                            padding-bottom: 18px;
                          "
                        >
                          DATA DRIVEN DECISIONS
                        </div>

                        <div
                          style="
                            font-family: Arial, Helvetica, sans-serif;
                            font-size: 18px;
                            line-height: 30px;
                            color: #666666;
                          "
                        >
                          I use feedback, analytics and testing insights to
                          improve user experience and conversion.
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- ====================================== -->
              <!-- FEATURE 4 -->
              <!-- ====================================== -->

              <tr>
                <td bgcolor="#f2ebe5" style="padding: 35px 50px 0">
                  <table
                    role="presentation"
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                  >
                    <tr>
                     

                         <td align="center" valign="top" style="padding: 0 10px">
                        <table
                          role="presentation"
                          cellpadding="0"
                          cellspacing="0"
                          width="150"
                          height="150"
                          style="
                            background: #f7f5f2;
                            border: 1px solid #ffffff;
                            border-radius: 22px;
                          "
                        >
                          <tr>
                            <td align="center" style="padding: 28px 20px 18px">
                              <img
                          src="https://res.cloudinary.com/dwtbzhlph/image/upload/v1783854051/deal_fs0xzy.png"

                          width="80"
                          style="display: block; border: 0"
                          alt="Problem Solving"
                        />
                            </td>
                          </tr>

                        </table>
                      </td>
                      

                      <td valign="top" style="padding-left: 30px">
                        <div
                          style="
                            font-family: Arial, Helvetica, sans-serif;
                            font-size: 30px;
                            font-weight: 700;
                            color: #4a4a4a;
                            padding-bottom: 18px;
                          "
                        >
                          COLLABORATIVE MINDSET
                        </div>

                        <div
                          style="
                            font-family: Arial, Helvetica, sans-serif;
                            font-size: 18px;
                            line-height: 30px;
                            color: #666666;
                          "
                        >
                          I work closely with developers to ensure smooth
                          implementation and successful product delivery.
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- ====================================== -->
              <!-- PHONE ILLUSTRATION -->
              <!-- ====================================== -->

              <tr>
                <td
                  align="center"
                  bgcolor="#f2ebe5"
                  style="padding: 70px 0 70px"
                >
                  <img
                    src="https://res.cloudinary.com/dwtbzhlph/image/upload/v1782755604/Untitled_-_27_June_2026_at_17.20.21_liqo6n.png"
                    width="700"
                    alt="PayU Mobile"
                    style="
                      display: block;
                      width: 100%;
                      max-width: 700px;
                      border: 0;
                    "
                  />
                </td>
              </tr>

              <!-- ====================================== -->
              <!-- CTA -->
              <!-- ====================================== -->

              <tr>
                <td align="center" bgcolor="#f2ebe5" style="padding: 0 0 100px">
                    <table
  role="presentation"
  cellspacing="0"
  cellpadding="0"
  border="0"
  style="background:#FFFFFF;border-radius:999px;"
>
  <tr>
    <td
      style="
        padding:0 28px;
        height:56px;
        font-family:Arial,Helvetica,sans-serif;
        font-size:20px;
        line-height:20px;
        color:#000000;
        white-space:nowrap;
      "
    >
      <a href="#" style="color:#000000;text-decoration:none;line-height:56px;display:block;">
        Contact Me
      </a>
    </td>

    <td style="padding-right:5px;">
      <table
        role="presentation"
        cellpadding="0"
        cellspacing="0"
        width="46"
        height="46"
        style="background:#D9D9D9;border-radius:50%;"
      >
        <tr>
        <td align="center" valign="middle">
    <img
        src="https://res.cloudinary.com/dwtbzhlph/image/upload/v1783775235/arrow-up-right_1_ynexfb.png"
        width="28"
        height="28"
        alt=""
        style="display:block;border:0;"
    >
</td>
        </tr>
      </table>
    </td>
  </tr>
</table>
                </td>
              </tr>

              <!-- ====================================== -->
              <!-- FOOTER -->
              <!-- ====================================== -->

              <tr>
                <td
                  align="center"
                  bgcolor="#f2ebe5"
                  style="padding: 0 30px 40px"
                >
                  <table
                    role="presentation"
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    style="
                      max-width: 740px;
                      background: #DCDCDC;
                      border-radius: 34px;
                      overflow: hidden;
                    "
                  >
                    <!-- ====================================== -->
                    <!-- TOP IMAGE -->
                    <!-- ====================================== -->

                    <tr>
                      <td>
                        <img
                          src="https://res.cloudinary.com/dwtbzhlph/image/upload/v1782543994/bikash-ezgif.com-optimize_zbchud.gif"
                          width="640"
                          alt=""
                          style="
                            display: block;
                            width: 100%;
                            max-width: 640px;
                            border: 0;
                            mix-blend-mode:darken;
                          "
                        />
                      </td>
                    </tr>

                    <!-- ====================================== -->
                    <!-- CONTENT -->
                    <!-- ====================================== -->

                    <tr>
                      <td
                        style="
                          padding: 45px 42px;
                          font-family: Arial, Helvetica, sans-serif;
                        "
                      >
                        <table
                          role="presentation"
                          width="100%"
                          cellpadding="0"
                          cellspacing="0"
                        >
                          <tr>
                            <!-- LEFT -->

                            <td width="50%" height="220" valign="top">
                              <img
                                src="https://res.cloudinary.com/dwtbzhlph/image/upload/v1782755547/Untitled_-_June_28_2026_at_23.10.22_1_pcpof3.png"
                                width="280"
                                height="300"
                                alt="BP"
                                

                                style="display: block; border: 0;object-fit: cover;margin-top:-80px"
                              />
                            </td>

                            <!-- RIGHT -->

                            <td width="50%" align="right" valign="top">
                              <!-- Button -->

                               <table
  role="presentation"
  cellspacing="0"
  cellpadding="0"
  border="0"
  style="background:#FFFFFF;border-radius:999px;"
>
  <tr>
    <td
      style="
        padding:0 28px;
        height:56px;
        font-family:Arial,Helvetica,sans-serif;
        font-size:20px;
        line-height:20px;
        color:#000000;
        white-space:nowrap;
      "
    >
      <a href="#" style="color:#000000;text-decoration:none;line-height:56px;display:block;">
        View Portfolio
      </a>
    </td>

    <td style="padding-right:5px;">
      <table
        role="presentation"
        cellpadding="0"
        cellspacing="0"
        width="46"
        height="46"
        style="background:#D9D9D9;border-radius:50%;"
      >
        <tr>
        <td align="center" valign="middle">
    <img
        src="https://res.cloudinary.com/dwtbzhlph/image/upload/v1783775235/arrow-up-right_1_ynexfb.png"
        width="28"
        height="28"
        alt=""
        style="display:block;border:0;"
    >
</td>
        </tr>
      </table>
    </td>
  </tr>
</table>

                              <div style="height: 30px"></div>

                              <div
                                style="
                                  font-size: 18px;
                                  line-height: 28px;
                                  color: #333333;
                                "
                              >
                                bikashpandey835@gmail.com
                              </div>

                              <div style="height: 24px"></div>

                              <table
                                role="presentation"
                                align="right"
                                cellpadding="0"
                                cellspacing="0"
                              >
                                <tr>
                                  <td style="padding-left: 10px">
                                    <a href="https://facebook.com/">
                                      <img
                                        src="https://res.cloudinary.com/dwtbzhlph/image/upload/v1782543992/facebook_hrs6er.png"
                                        width="42"
                                        style="display: block; border: 0"
                                        alt="Facebook"
                                      />
                                    </a>
                                  </td>

                                  <td style="padding-left: 10px">
                                    <a href="https://instagram.com/">
                                      <img
                                        src="https://res.cloudinary.com/dwtbzhlph/image/upload/v1782543992/instagram_jxai6b.png"
                                        width="42"
                                        style="display: block; border: 0"
                                        alt="Instagram"
                                      />
                                    </a>
                                  </td>

                                  <td style="padding-left: 10px">
                                    <a href="https://github.com/">
                                      <img
                                        src="https://res.cloudinary.com/dwtbzhlph/image/upload/v1782543992/github-sign_1_tloisv.png"
                                        width="42"
                                        style="display: block; border: 0"
                                        alt="GitHub"
                                      />
                                    </a>
                                  </td>

                                  <td style="padding-left: 10px">
                                    <a href="https://x.com/">
                                      <img
                                        src="https://res.cloudinary.com/dwtbzhlph/image/upload/v1782543992/twitter_aqilby.png"
                                        width="42"
                                        style="display: block; border: 0"
                                        alt="X"
                                      />
                                    </a>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- ====================================== -->
                    <!-- COPYRIGHT -->
                    <!-- ====================================== -->

                    <tr>
                      <td
                        style="
                          padding: 0 42px 40px;
                          font-family: Arial, Helvetica, sans-serif;
                        "
                      >
                        <table
                          role="presentation"
                          width="100%"
                          cellpadding="0"
                          cellspacing="0"
                        >
                          <tr>
                            <td
                              align="left"
                              style="font-size: 16px; color: #7a7a7a"
                            >
                              © 2026 Bikash Pandey
                            </td>

                            <td
                              align="right"
                              style="font-size: 16px; color: #7a7a7a"
                            >
                              All Rights Reserved
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </center>
  </body>
</html>


`;

      await emailSvc.sendEmail({
        to: email,
        subject: "Registration Success",
        message: msg,
      });
    } catch (exception) {
      console.log(exception);
      throw exception;
    }
  };

  getSingleUserByFilter = async (filter) => {
    try {
      const user = await UserModel.findOne(filter);
      if (!user) {
        throw {
          code: "422",
          status: "USER_NOT_FOUND",
          message: "User not found",
          detail: "",
        };
      }

      return user;
    } catch (exception) {
      console.log("GETSIGNLEUSERBYFILTER ERROR : ", exception);
      throw exception;
    }
  };

  userfind = async (filter) => {
    try {
      const user = await UserModel.findOne(filter, {
        password: 0,
        otp: 0,
        otpExpiryTime: 0,
        _v: 0,
        createdAt: 0,
        updatedAt: 0,
      });

      if (!user) {
        throw {
          code: "422",
          status: "USER_NOT_FOUND",
          message: "User not found",
          detail: "",
        };
      }
      return user;
    } catch (exception) {
      throw exception;
    }
  };

  resetOtp = async (user) => {
    try {
      //new otp
      let otp = randomStringGenerator(6, false);
      let expiryTime = new Date(Date.now() + 300000);

      user.otp = otp;
      user.otpExpiryTime = expiryTime;

      return await user.save();
    } catch (exception) {
      console.log("RESETOTP ERROR : ", exception);
      throw exception;
    }
  };
  activateUser = async (user) => {
    try {
      user.otp = null;
      user.otpExpiryTime = null;
      user.status = "active";

      return await user.save();
    } catch (exception) {
      console.log("ActivateUser", exception);
      throw exception;
    }
  };

  getAllUsers = async ({ skip = 0, limit = 20, filter = {} }) => {
    try {
      const userList = await UserModel.find(filter, {
        password: 0,
        otp: 0,
        otpExpiryTime: 0,
        _v: 0,
        createdAt: 0,
        updatedAt: 0,
      })
        .skip(skip)
        .limit(limit)
        .sort({
          createdAt: "desc",
        });
      return userList;
    } catch (exception) {
      throw exception;
    }
  };

  deleteByFilter = async (filter) => {
    try {
      const resp = await UserModel.findOneAndDelete(filter);
      return resp;
    } catch (exception) {
      throw exception;
    }
  };
  updateMyProfile = async (data) => {
    try {
      const response = await UserModel.findByIdAndUpdate(
        data._id,
        { $set: data },
        { new: true },
      );
      return response;
    } catch (exception) {
      throw exception;
    }
  };
}
const authSvc = new AuthService();
module.exports = authSvc;
