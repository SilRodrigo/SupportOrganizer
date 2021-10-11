const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const core = require('./core')

app.use(cookieParser());
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

function authenticate(sessionKey, _callBack) {
  core.authenticate(sessionKey)
    .then((e) => {
      if (_callBack) return _callBack(e)
      return e;
    })
    .catch((e) => {
      if (!e) e = { status: 404 }
      if (_callBack) return _callBack(e)
      return e;
    })
}

app.get('/', function (req, res) {
  res.redirect('/main')
});

app.get('/main', function (req, res) {
  core.authenticate(req.cookies.sessionKey)
    .then(() => {
      return res.sendFile('main.html', { root: './view/' });
    })
    .catch(() => {
      return res.sendFile('login.html', { root: './view/' });
    })
});

app.get("/login", (req, res) => {
  core.authenticate(req.cookies.sessionKey)
    .then(() => {
      return res.redirect('/main')
    })
    .catch(() => {
      return res.sendFile('login.html', { root: './view/' });
    })
});

app.get("/logout", (req, res) => {
  res.clearCookie('sessionKey');
  return res.sendFile('login.html', { root: './view/' });
});

app.get('/pendingSupports', async function (req, res) {
  authenticate(req.cookies.sessionKey, async (ret) => {
    if (ret.status != 200) return res.json(ret)
    ret = await core.pendingSupports(ret.dbObject)
    return res.json(ret)
  })
})

app.get('/updateSupports', async function (req, res) {
  res.set('Content-Type', 'application/json');
  return res.json(await core.userSupports(req.cookies.sessionKey))
});

app.get('/pageResources', async function (req, res) {
  authenticate(req.cookies.sessionKey, async (ret) => {
    if (ret && ret.status != 200) return res.json(ret)
    ret = await core.loadResources(ret.dbObject)
    return res.json(ret)
  })
});

app.get('/report', async function (req, res) {
  authenticate(req.cookies.sessionKey, async (ret) => {
    if (ret && ret.status != 200) return res.json(ret)
    let request = req.query.param;
    let date = new Object();
    date.start = request[0];
    date.end = request[1];
    core.dataForReport(date, ret.dbObject, request[2])
      .then(ret => {
        res.writeHead(200, { 'Content-Type': 'application/force-download', 'Content-disposition': 'attachment; filename=relatorio.txt' });
        res.end(ret.dbObject);
      })
      .catch(ret => {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.json(ret);
      })
  })
});

app.post("/login", (req, res) => {
  let userData = { name: req.body.name, password: req.body.password }
  core.login(userData)
    .then(ret => {
      res.cookie('sessionKey', ret.dbObject.sessionKey)
      return res.json(ret)
    })
    .catch(ret => { return res.json(ret) })
});

app.post('/supportTaken', async function (req, res) {
  authenticate(req.cookies.sessionKey, async (ret) => {
    if (ret && ret.status != 200) return res.json(ret)
    res.set('Content-Type', 'application/json')
    ret = await core.addSupportToUser(req.body.id, req.cookies.sessionKey);
    return res.json(ret);
  })
});

app.post('/register/new/support', async function (req, res) {
  authenticate(req.cookies.sessionKey, async (ret) => {
    if (ret && ret.status != 200) return res.json(ret)
    let support = req.body
    ret = await core.registerNewSupport(support, ret.dbObject)
    return res.json(ret)
  })
});

app.post('/registerQuickSupport', async function (req, res) {
  authenticate(req.cookies.sessionKey, async (ret) => {
    if (ret && ret.status != 200) return res.json(ret)
    ret = await core.registerQuickSupport(req.body, ret.dbObject)
    return res.json(ret)
  })
});

app.post('/excludeSupport', async function (req, res) {
  authenticate(req.cookies.sessionKey, async (ret) => {
    if (ret && ret.status != 200) return res.json(ret)
    let support = req.body;
    ret = await core.excludeSupport(support.id);
    return res.json(ret);
  })
});

app.post('/updateStatus', async function (req, res) {
  authenticate(req.cookies.sessionKey, async (ret) => {
    if (!ret || ret && ret.status != 200) return res.json(ret)
    let user = ret.dbObject;
    let support = req.body;
    ret = await core.updateStatus(support, user);
    return res.json(ret);
  })
});

// TESTING

app.get('/manualAdjust', function (req, res) {
  res.sendStatus(200);
  /* Requisição para testes */
});

// ---------

core.dbConnect();

app.listen(8080, () => {
  console.log("App SupportOrganizer listening on port 8080...");
});