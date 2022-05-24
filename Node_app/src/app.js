const express = require('express');
const ejsMate = require('ejs-mate')
const path = require('path')
const app = express();
const mysql = require('mysql')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const bcrypt = require('bcrypt')
const session = require('express-session')
const ExpressError = require('./utils/ExpressError')
const pathForPublic = path.join(__dirname, '../public');
// console.log(pathForPublic);
app.use(express.static(pathForPublic))


app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.engine('ejs', ejsMate)
app.use(methodOverride('_method'))


const sessionConfig = {
    secret: 'mappesecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 10000 * 60 * 60 * 24 * 7,
        maxAge: 10000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))

app.use((req, res, next) => {
    res.locals.username = req.session.username;
    next()
})

const requireLogin = (req, res, next) => {
    if (!req.session.username) {
        return res.redirect('/mappe.com/login')
    } else {
        next()
    }
}


//create connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mappe',
    multipleStatements: true
});

//connecting to DB
db.connect((err) => {
    if (err) throw err;
    console.log('Database connected');
});


app.get('/mappe.com', (req, res) => {
    res.redirect('/mappe.com/login');
})

app.get('/mappe.com/login', (req, res) => {
    res.render('Login/login');
})

app.post('/mappe.com/login', (req, res, next) => {
    try {
        const loginObj = { ...req.body };
        const { email } = req.body
        const query = 'SELECT pass from registration where email = ?'
        db.query(query, [email], (err, result) => {
            if (err) throw new ExpressError(err.statusCode, err.message)
            const originalPassword = result[0].pass;
            if (originalPassword === loginObj.pass) {
                req.session.username = email;
                // res.redirect(`http://localhost:3000/mappe.com/${req.session.username}/edu-details`)
                // res.redirect(`http://localhost:3000/mappe.com/${req.session.username}/get-achievement-choice`)

                // res.redirect('http://localhost:3000/mappe.com/courseOrCertification')
                // res.redirect('http://localhost:3000/mappe.com/skills')
                // res.redirect('http://localhost:3000/mappe.com/projectAndInternship')
                // res.redirect('http://localhost:3000/mappe.com/details')
                res.redirect(`http://localhost:3000/${req.session.username}`)

            } else {
                res.redirect('/mappe.com/login');
            }
        })
    } catch (e) {
        next(e);
    }
})

app.get('/mappe.com/register', (req, res) => {
    res.render('Login/register')
})

app.post('/mappe.com/register', (req, res, next) => {
    try {
        const registerObj = { ...req.body };
        const { email } = req.body;
        const query = 'INSERT INTO registration set ?'
        db.query(query, registerObj, (err, result) => {
            if (err) throw new ExpressError(err.statusCode, err.message);
            console.log(req.session.username, email)
            req.session.username = email;
            res.redirect(`http://localhost:3000/mappe.com/${req.session.username}/edu-details`);

            // res.redirect(`http://localhost:3000/mappe.com/${req.session.username}/get-achievement-choice`)
        })

    } catch (e) {
        next(e);
    }

})

app.post('/mappe.com/customized', requireLogin, (req, res, next) => {
    try {
        const email = req.session.username;

        const { acadescription } = req.body;
        const acaObj = { email, acadescription };
        const query1 = `Insert into cacademics set ?`
        db.query(query1, acaObj, (err, result) => {
            if (err) throw new ExpressError(err.statusCode, err.message);
        })

        const { codescription } = req.body;
        const coObj = { email, codescription };
        const query2 = 'Insert into ccoordinator set ?'
        db.query(query2, coObj, (err, result) => {
            if (err) throw new ExpressError(err.statusCode, err.message);
        })

        const { culdescription } = req.body;
        const culObj = { email, culdescription };
        const query3 = 'Insert into ccultural set ?'
        db.query(query3, culObj, (err, result) => {
            if (err) throw new ExpressError(err.statusCode, err.message);
        })

        const { spodescription } = req.body;
        const spoObj = { email, spodescription };
        const query4 = 'Insert into csportsach set ?'
        db.query(query4, spoObj, (err, result) => {
            if (err) throw new ExpressError(err.statusCode, err.message);
        })

        setTimeout(() => {
            res.render('User-info/courseOrCertificateDetails');
        }, 3000);

    } catch (e) {
        next(e);
    }
})

app.post('/mappe.com/non-customized', requireLogin, (req, res, next) => {
    try {
        const email = req.session.username;
        const { acadname, acadtype, acadorganizedby, acadprize } = req.body;
        const acaObj = { email, acadname, acadtype, acadorganizedby, acadprize };
        const query1 = 'INSERT INTO academicach SET ?'
        db.query(query1, acaObj, (err, result) => {
            if (err) throw new ExpressError(err.statusCode, err.message);
            const { cotype, coname, corole, codescription } = req.body;
            const coObj = { email, cotype, coname, corole, codescription };
            const query2 = 'Insert into coordinator set ?'
            db.query(query2, coObj, (err1, result) => {
                if (err1) throw new ExpressError(err.statusCode, err.message);
            })
            const { culturalname, cultype, cuorganizedby, cuprize } = req.body;
            const culObj = { email, culturalname, cultype, cuorganizedby, cuprize }
            const query3 = 'Insert into cultural set ?'
            db.query(query3, culObj, (err2, result) => {
                if (err2) throw new ExpressError(err.statusCode, err.message);
            })
            const { sportsname, spoperiod, spoprize } = req.body;
            const sportObj = { email, sportsname, spoperiod, spoprize };
            const query4 = 'Insert into sportsach set ?'
            db.query(query4, sportObj, (err3, result) => {
                if (err3) throw new ExpressError(err.statusCode, err.message);
            })

            setTimeout(() => {
                res.render('User-info/courseOrCertificateDetails');
            }, 3000);
        })


    } catch (e) {
        next(e);
    }
})

app.post('/mappe.com/edu-details', requireLogin, (req, res, next) => {
    try {
        const email = req.session.username;
        const { schoolname, scity, spincode, syearofpass, sboard, smarks } = req.body;
        const schoolDetails = { email, schoolname, scity, spincode, syearofpass, sboard, smarks };
        const { collegename, pcity, ppincode, pyearofpass, pboard, pmarks, pcombination } = req.body;
        const collegeDetails = { email, collegename, pcity, ppincode, pyearofpass, pboard, pcombination, pmarks };
        const { dcollegename, dcity, dpincode, dyearofpass, dbranch, dcgpa } = req.body;
        const diplomaDetails = { email, dcollegename, dcity, dpincode, dyearofpass, dbranch, dcgpa };
        const { ecollegename, ecity, epincode, eyearofpass, ebranch, eboard, ecgpa } = req.body;
        const engineeringDetails = { email, ecollegename, ecity, epincode, eyearofpass, eboard, ebranch, ecgpa };

        const query1 = 'INSERT INTO school SET ?'
        db.query(query1, schoolDetails, (err, result) => {
            if (err) throw new ExpressError(err.statusCode, err.message);
            const query2 = 'INSERT INTO puc SET ?'
            db.query(query2, collegeDetails, (err, result) => {
                if (err) throw new ExpressError(err.statusCode, err.message);
            })
            const query3 = 'INSERT INTO diploma SET ?'
            db.query(query3, diplomaDetails, (err, result) => {
                if (err) throw new ExpressError(err.statusCode, err.message);
            })
            const query4 = 'INSERT INTO engineering SET ?'
            db.query(query4, engineeringDetails, (err, result) => {
                if (err) throw new ExpressError(err.statusCode, err.message);
            })
        })


        setTimeout(() => {
            res.render('User-info/get-achievement-choice')
        }, 5000);

    } catch (e) {
        next(e);
    }
})

app.post('/mappe.com/skills', requireLogin, (req, res, next) => {
    try {
        const email = req.session.username;
        const { skill1, skill2, skill3, skill4, skill5, skill6, rating1, rating2, rating3, rating4, rating5, rating6 } = req.body;
        const skillObj1 = { email, skillname: skill1, rating: rating1 };
        const query1 = 'insert into skills set ?'
        db.query(query1, skillObj1, (err, result) => {
            if (err) throw new ExpressError(err.statusCode, err.message);
        })

        const skillObj2 = { email, skillname: skill2, rating: rating2 }
        const query2 = 'insert into skills set ?'
        db.query(query2, skillObj2, (err, result) => {
            if (err) throw new ExpressError(err.statusCode, err.message);
        })

        const skillObj3 = { email, skillname: skill3, rating: rating3 }
        const query3 = 'insert into skills set ?'
        db.query(query3, skillObj3, (err, result) => {
            if (err) throw new ExpressError(err.statusCode, err.message);
        })

        const skillObj4 = { email, skillname: skill4, rating: rating4 }
        const query4 = 'insert into skills set ?'
        db.query(query4, skillObj4, (err, result) => {
            if (err) throw new ExpressError(err.statusCode, err.message);
        })

        const skillObj5 = { email, skillname: skill5, rating: rating5 }
        const query5 = 'insert into skills set ?'
        db.query(query5, skillObj5, (err, result) => {
            if (err) throw new ExpressError(err.statusCode, err.message);
        })

        const skillObj6 = { email, skillname: skill6, rating: rating6 }
        const query6 = 'insert into skills set ?'
        db.query(query6, skillObj6, (err, result) => {
            if (err) throw new ExpressError(err.statusCode, err.message);
        })

        setTimeout(() => {
            res.render('User-info/projectAndInternship')
        }, 3000);
    } catch (e) {
        next(e);
    }
})

app.post('/mappe.com/courseOrCertification', requireLogin, (req, res, next) => {
    try {
        const email = req.session.username;

        const { coursename, courseplatform, courselink, start_date, end_date, certificate_link } = req.body;
        const courseObj = { email, coursename, courseplatform, courselink, start_date, end_date, certificate_link };
        const query = 'insert into course set ?'
        db.query(query, courseObj, (err, result) => {
            if (err) throw new ExpressError(err.statusCode, err.message);
        })

        const { certificatename, certificationplatform, certificationlink, cert_start_date } = req.body;
        const certificationObj = { email, certificatename, certificationplatform, certificationlink, cert_start_date }
        const query2 = 'insert into certification set ?'
        db.query(query2, certificationObj, (err, result) => {
            if (err) throw new ExpressError(err.statusCode, err.message);
        })

        setTimeout(() => {
            res.render('User-info/skills')
        }, 3000);

    } catch (e) {
        next(e);
    }
})

app.post('/mappe.com/projectAndInternship', requireLogin, (req, res, next) => {
    try {
        const email = req.session.username;
        const { projectname, projectdomain, projectdescription, projectguide, start_date, end_date, languages, projectlink } = req.body;
        const projectObj = { email, projectname, projectdomain, projectdescription, projectguide, start_date, end_date, languages, projectlink }
        const query1 = 'insert into projects set ?'
        db.query(query1, projectObj, (err, result) => {
            if (err) throw new ExpressError(err.statusCode, err.message);
        })

        const { companyname, jobrole, aboutjob, intern_start_date, intern_end_date } = req.body;
        const internshipObj = { email, companyname, jobrole, aboutjob, intern_start_date, intern_end_date }
        const query2 = 'insert into internships set ?'
        db.query(query2, internshipObj, (err, result) => {
            if (err) throw new ExpressError(err.statusCode, err.message);
        })
        setTimeout(() => {
            res.render('User-info/details')
        }, 2000);
    } catch (e) {
        next(e);
    }
})

app.post('/mappe.com/details', requireLogin, (req, res, next) => {
    try {
        const email = req.session.username;
        const { about, strength, weakness } = req.body;
        const detailsObj = { email, about, strength, weakness };
        const query = 'insert into details set ?';
        db.query(query, detailsObj, (err, result) => {
            if (err) throw new ExpressError(err.statusCode, err.message);
        })
        setTimeout(() => {
            res.redirect(`http://localhost:3000/${req.session.username}`)
        }, 3000);
    } catch (e) {
        next(e);
    }
})





app.get('/myStrengthsAndWeaknessess', (req, res, next) => {
    try {
        const email = req.session.username;
        const details = {}
        const query = 'select strength, weakness from details where email = ?'
        db.query(query, [email], (err, result) => {
            if (err) throw new ExpressError(err.statusCode, err.message);
            // console.log(result)
            let strength = result[0].strength + '';
            let weakness = result[0].weakness + '';
            let strengthArray = strength.split(',')
            let weaknessArray = weakness.split(',')
            // console.log(strengthArray, weaknessArray);
            details.strength = strengthArray
            details.weakness = weaknessArray
            console.log(details)
            res.render('Portfolio/strengthsAndWeaknessess', { details })
        })
    } catch (e) {
        next(e);
    }
})

app.get('/mySkills', (req, res, next) => {
    try {
        const email = req.session.username;
        const query = 'select * from skills where email = ? group by ?'
        db.query(query, [email], (err, result) => {
            if (err) throw new ExpressError(err.statusCode, err.message);
            console.log(result);
        })
    } catch (e) {
        next(e);
    }
})

app.get('/myCoursesAndCertifications', (req, res) => {

})

app.get('/myAchievements', (req, res) => {

})

app.get('/myProjectsAndInternships', (req, res) => {

})






app.get('/mappe.com/details', requireLogin, (req, res) => {
    res.render('User-info/details')
})

app.get('/mappe.com/projectAndInternship', requireLogin, (req, res) => {
    res.render('User-info/projectAndInternship')
})

app.get('/mappe.com/skills', requireLogin, (req, res) => {
    res.render('User-info/skills')
})

app.get('/mappe.com/courseOrCertification', requireLogin, (req, res) => {
    res.render('User-info/courseOrCertificateDetails');
})

app.get('/mappe.com/:username/edu-details', requireLogin, (req, res) => {
    res.render('User-info/education')
})

app.get('/mappe.com/:username/get-achievement-choice', requireLogin, (req, res) => {
    res.render('User-info/get-achievement-choice')
})


app.get('/mappe.com/customized-ach', requireLogin, (req, res, next) => {
    res.render('User-info/customized-ach')
})

app.get('/mappe.com/non-customized-ach', requireLogin, (req, res, next) => {
    res.render('User-info/non-customized-ach')
})




app.get('/mappe.com/:username/achievements', (req, res) => {
    res.render('User-info/achievements')
})

app.get('/:username', (req, res) => {
    try {
        const email = req.session.username;
        const user = {};
        const query1 = `select fname, lname from registration where email = ?`
        db.query(query1, [email], (err, result) => {
            if (err) throw new ExpressError(err.statusCode, err.message);
            // console.log(result);
            user.name = result[0].fname + ' ' + result[0].lname;
        })

        const query2 = 'select about from details where email = ?'
        db.query(query2, [email], (err, result) => {
            if (err) throw new ExpressError(err.statusCode, err.message);
            // console.log(result);
            user.about = result[0].about;
        })

        const query3 = 'select * from school where email = ?'
        db.query(query3, [email], (err, result) => {
            if (err) throw new ExpressError(err.statusCode, err.message);
            // console.log(result);
            user.school = { ...result[0] }
        })

        const query4 = 'select * from puc where email = ?'
        db.query(query4, [email], (err, result) => {
            if (err) throw new ExpressError(err.statusCode, err.message);
            // console.log(result);
            user.puc = { ...result[0] }
        })

        const query5 = 'select * from diploma where email = ?'
        db.query(query5, [email], (err, result) => {
            if (err) throw new ExpressError(err.statusCode, err.message);
            // console.log(result);
            if (result[0].dcollegename !== '')
                user.diploma = { ...result[0] }
        })

        const query6 = 'select * from engineering where email = ?'
        db.query(query6, [email], (err, result) => {
            if (err) throw new ExpressError(err.statusCode, err.message);
            // console.log(result);
            user.engineering = { ...result[0] }
        })

        setTimeout(() => {
            // console.log(user)
            res.render("Portfolio/studentHome", { user })
        }, 1000);
    } catch (e) {
        next(e);
    }
})

app.use('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message) err.message = 'Oh no, Something went wrong!'
    res.status(statusCode).render('error', { err })
});

app.listen(3000, (req, res) => {
    console.log("App is listening to port 3000")
})