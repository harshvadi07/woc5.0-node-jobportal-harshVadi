const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

mongoose.set("strictQuery", true);
mongoose.connect("mongodb://localhost:27017/jobPortal");

const credential = mongoose.Schema({
  email: String,
  password: String,
  type: String,
});

const student = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  phoneNumber: Number,
  university: String,
  degree: String,
  year: Number,
  cpi: String,
  age: Number,
  gender: String,
  skills: String,
  type: String,
});

const company = mongoose.Schema({
  companyName: String,
  email: String,
  password: String,
  website: String,
  reqDegree: String,
  reqCpi: String,
  position: String,
  package: Number,
  description: String,
});

const Student = mongoose.model("Student", student);
const Company = mongoose.model("Company", company);
const Credential = mongoose.model("Credential", credential);

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/student", function (req, res) {
  res.render("studentSignUp");
});

app.get("/company", function (req, res) {
  res.render("companySignUp");
});

let name = "";
let studentDetails;
let companyDetais;
let typeOfUser = "";

app.post("/student", function (req, res) {
  const newStudent = new Student({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    phoneNumber: req.body.phoneNumber,
    university: req.body.university,
    degree: req.body.degree,
    year: req.body.year,
    cpi: req.body.cpi,
    age: req.body.age,
    gender: req.body.gender,
    skills: req.body.skills,
  });

  const newCredential = new Credential({
    email: req.body.email,
    password: req.body.password,
    type: "student",
  });

  studentDetails = newStudent;

  newStudent.save();
  newCredential.save();
  res.redirect("/studentProfile");
});

app.post("/company", function (req, res) {
  const newCompany = new Company({
    companyName: req.body.companyName,
    email: req.body.email,
    password: req.body.password,
    website: req.body.website,
    reqDegree: req.body.reqDegree,
    reqCpi: req.body.reqCpi,
    position: req.body.position,
    package: req.body.package,
    description: req.body.description,
  });

  const newCredential = new Credential({
    email: req.body.email,
    password: req.body.password,
    type: "company",
  });

  companyDetais = newCompany;

  newCompany.save();
  newCredential.save();
  res.redirect("/companyProfile");
});

let errorMsg = false;
app.get("/signin", function (req, res) {
  if (errorMsg) {
    res.render("signin", { errorMsg: "Invalid email or password" });
  } else {
    res.render("signin", { errorMsg: "" });
  }
});

app.post("/signin", async function (req, res) {
  const cred = await Credential.findOne({
    email: req.body.email,
    password: req.body.password,
  });

  if (cred) {
    if (cred.type === "student") {
      Student.findOne(
        {
          email: req.body.email,
          password: req.body.password,
        },
        function (err, student) {
          if (student) {
            name = student.firstName;
            studentDetails = student;
            res.redirect("/studentProfile");
          }
        }
      );
    } else {
      Company.findOne(
        {
          email: req.body.email,
          password: req.body.password,
        },
        function (err, company) {
          if (company) {
            companyDetais = company;
            res.redirect("/companyProfile");
          }
        }
      );
    }
  } else {
    errorMsg = true;
    res.redirect("/signin");
  }
});

app.get("/studentProfile", function (req, res) {
  res.render("student", {
    name: name,
    student: studentDetails,
  });
});

app.get("/companyProfile", function (req, res) {
  res.render("company", {
    company: companyDetais,
  });
});

let editStudent;
let editCompany;

app.post("/edit", function (req, res) {
  Student.findById(req.body.id, function (err, student) {
    if (student) {
      editStudent = student;
      res.redirect("/editStudent");
    } else {
      console.log("No student found.");
    }
  });

  Company.findById(req.body.id, function (err, company) {
    if (company) {
      editCompany = company;
      res.redirect("/editCompany");
    } else {
      console.log("No company found.");
    }
  });
});

app.get("/editStudent", function (req, res) {
  res.render("editStudent", { student: editStudent });
});

app.get("/editCompany", function (req, res) {
  res.render("editCompany", { company: editCompany });
});

app.post("/editStudent", function (req, res) {
  Student.findByIdAndUpdate(
    req.body.id,
    {
      $set: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        phoneNumber: req.body.phoneNumber,
        university: req.body.university,
        degree: req.body.degree,
        year: req.body.year,
        cpi: req.body.cpi,
        age: req.body.age,
        gender: req.body.gender,
        skills: req.body.skills,
        type: "student",
      },
    },
    function (err) {
      if (!err) {
        console.log("Updated successfully.");
        Student.findOne(
          {
            email: req.body.email,
            password: req.body.password,
          },
          function (err, student) {
            if (student) {
              name = student.firstName;
              studentDetails = student;
              res.redirect("/studentProfile");
            } else {
              console.log("No student Found.");
              errorMsg = true;
              res.redirect("/signin");
            }
          }
        );
      } else {
        console.log(err);
      }
    }
  );
});

app.post("/editCompany", function (req, res) {
  Company.findByIdAndUpdate(
    req.body.id,
    {
      $set: {
        companyName: req.body.companyName,
        email: req.body.email,
        password: req.body.password,
        website: req.body.website,
        reqDegree: req.body.reqDegree,
        reqCpi: req.body.reqCpi,
        position: req.body.position,
        package: req.body.package,
        description: req.body.description,
      },
    },
    function (err) {
      if (!err) {
        console.log("Updated Successfully");
        Company.findOne(
          {
            email: req.body.email,
            password: req.body.password,
          },
          function (err, company) {
            if (company) {
              companyDetais = company;
              res.redirect("/companyProfile");
            } else {
              console.log("No Company Found.");
              errorMsg = true;
              res.redirect("/signin");
            }
          }
        );
      } else {
        console.log(err);
      }
    }
  );
});

app.post("/delete", function (req, res) {
  Student.findByIdAndRemove(req.body.id, function (err) {
    if (!err) {
      res.redirect("/deleted");
    }
  });

  Company.findByIdAndRemove(req.body.id, function (err) {
    if (!err) {
      res.redirect("/deleted");
    }
  });
});

app.post("/search", function (req, res) {
  console.log(req.body);
  const currStudent = studentDetails;
  console.log(currStudent);

  Company.find(
    {
      reqCpi: { $lte: currStudent.cpi },
    },
    function (err, company) {
      if (!err) {
        res.render("search", { companies: company, student: currStudent });
      } else {
        console.log(err);
      }
    }
  );
});

app.listen(3000, function () {
  console.log("Listening on port 3000");
});
