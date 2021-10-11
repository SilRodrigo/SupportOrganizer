const { ObjectID } = require('bson');
const mongoose = require('mongoose');
const db = mongoose.connection;
const users = new mongoose.Schema({ name: String, password: String, sessionKey: String, supportCompany: Number });
const user = mongoose.model('user', users);
const supports = new mongoose.Schema({ name: String, company: String, supportUser: ObjectID, date: String, time: String, comment: String, resolution: String, status: Number, closureDate: String, closureTime: String, supportCompany: Number });
const support = mongoose.model('support', supports);
const companies = new mongoose.Schema({ name: String, shortName: String, supportCompany: Number });
const company = mongoose.model('company', companies);

const SITUACAO = new class situacao {
    constructor() {
        this.ABERTO = 1;
        this.ATENDIMENTO = 2;
        this.ENCERRADO = 3;
        Object.freeze(this);
    }
}

const EMPRESA = new class empresa {
    constructor() {
        this.A = 1;
        this.B = 2;
    }
}

class serverReturn {
    constructor(status, serverMessage, dbObject) {
        try {
            this.status = status;
            this.serverMessage = serverMessage;
            this.dbObject = dbObject;
        } catch (error) {
            throw new Error(error);
        }
    }
}

module.exports.dbConnect = () => {
    mongoose.connect('mongodb://localhost/supportOrganizer', { useNewUrlParser: true, useUnifiedTopology: true });
    db.on('connected', function () {
        console.log('=====Conexão estabelecida com sucesso=====');
    });
    db.on('error', function (err) {
        console.log('=====Ocorreu um erro: ' + err);
    });
    db.on('disconnected', function () {
        console.log('=====Conexão finalizada=====');
    });
}

module.exports.authenticate = (cookie) => {
    return new Promise((resolve, reject) => {
        if (!cookie) return reject(new serverReturn(403, 'Sessão Inválida', null))
        user.findOne({ sessionKey: cookie }, function (err, obj) {
            if (obj) return resolve(new serverReturn(200, 'Autenticado', obj))
            return reject(new serverReturn(403, 'Não Autorizado', err))
        })
    })
}

module.exports.login = (userData) => {
    return new Promise((resolve, reject) => {
        findByEntity(user, userData)
            .then(ret => {
                if (ret.dbObject && ret.dbObject[0]) {
                    let cookie = generateCookie(ret.dbObject[0]._id);
                    let oldData = JSON.parse(JSON.stringify(ret.dbObject[0]));
                    let newData = JSON.parse(JSON.stringify(ret.dbObject[0]));
                    newData.sessionKey = cookie;
                    return updateEntity(user, oldData, newData)
                        .then(ret => {
                            ret.sessionKey = cookie;
                            return resolve(new serverReturn(200, 'Login Ok', ret))
                        })
                        .catch(ret => {
                            return reject(new serverReturn(403, '', ret));
                        })
                }
                return reject(new serverReturn(403, ret, null))
            })
            .catch(ret => {
                return reject(new serverReturn(403, ret, null))
            })
    })
}

module.exports.userRegister = (userData) => {
    return new Promise((resolve, reject) => {
        findByEntity(user, userData).then(ret => {
            if (ret.dbObject[0]) return reject('Já cadastrado')
            return saveUser(userData).then(ret => { return resolve(ret) });
        });
    });
}

module.exports.registerNewSupport = (supportData, userData) => {
    return new Promise((resolve) => {
        supportData.supportUser = null;
        supportData.status = SITUACAO.ABERTO;
        supportData.supportCompany = userData.supportCompany;
        newSupport = new support(supportData);
        newSupport.save(function (err, response) {
            if (err) resolve({ 'status': 401, 'serverMessage': err });
            resolve({ 'status': 200, 'serverMessage': 'Chamado registrado!', 'dbObject': response });
        })
    });
}

module.exports.registerQuickSupport = (supportData, userData) => {
    return new Promise((resolve) => {
        supportData.supportUser = userData._id;
        supportData.status = SITUACAO.ENCERRADO;
        supportData.supportCompany = userData.supportCompany;
        newSupport = new support(supportData);
        newSupport.save(function (err, response) {
            if (err) resolve({ 'status': 401, 'serverMessage': err });
            resolve({ 'status': 200, 'serverMessage': 'Chamado registrado!', 'dbObject': response });
        })
    });
}

module.exports.pendingSupports = (userData) => {
    return new Promise(async (resolve, reject) => {
        let ret = await findByEntity(support, { supportUser: null, supportCompany: userData.supportCompany });
        return resolve(ret);
    })
}

module.exports.userSupports = (session) => {
    return new Promise((resolve) => {
        findByEntity(user, { sessionKey: session })
            .then(ret => {
                let userId = ret.dbObject[0]._id;
                let sevenDaysBackDate = new Date();
                sevenDaysBackDate = new Date(sevenDaysBackDate.getFullYear(), sevenDaysBackDate.getMonth(), sevenDaysBackDate.getDate() - 7)
                sevenDaysBackDate = sevenDaysBackDate.getFullYear() + '-' + ('0' + (sevenDaysBackDate.getMonth() + 1)).slice(-2) + '-' + ('0' + (sevenDaysBackDate.getDate())).slice(-2);
                findByEntity(support, { $or: [{ supportUser: userId, status: 2 }, { supportUser: userId, status: 3, closureDate: { $gt: sevenDaysBackDate } }] })
                    .then(ret => {
                        return resolve(ret)
                    })
                    .catch(ret => {
                        return resolve(ret)
                    })
            })
            .catch(ret => {
                return resolve(ret)
            })
    })
}

module.exports.addSupportToUser = (supportId, session) => {
    return new Promise((resolve) => {
        if (!session) return resolve({ 'status': 403, 'serverMessage': 'Sessão inválida!' })
        findByEntity(user, { sessionKey: session })
            .then(ret => {
                updateEntity(support, { _id: supportId }, { supportUser: ret.dbObject[0]._id, status: SITUACAO.ATENDIMENTO })
                    .then(ret => {
                        return resolve(ret);
                    })
                    .catch(ret => {
                        return resolve(ret);
                    })
            })
            .catch(ret => {
                return resolve(ret);
            })
    })
}

module.exports.loadResources = (userData) => {
    return new Promise((resolve) => {
        findByEntity(company, { supportCompany: userData.supportCompany })
            .then(ret => {
                let newRet = new Object();
                newRet.status = ret.status;
                newRet.serverMessage = ret.serverMessage;
                newRet.dbObject = new Object();
                newRet.dbObject.companies = ret.dbObject;
                return resolve(newRet);
            })
            .catch(ret => {
                return resolve(ret);
            })
    })
}

module.exports.excludeSupport = (id) => {
    return new Promise((resolve, reject) => {
        support.deleteOne({ _id: id }, (err, response) => {
            if (err) return reject(new serverReturn(403, err));
            if (response.deletedCount === 0) reject(new serverReturn(403, 'Registro não encontrado.'));
            return resolve(new serverReturn(200, 'Excluído com sucesso!', response));
        })
    })
}

module.exports.saveCompanies = (companies) => {
    companies.forEach(e => {
        newCompany = new company(e);
        newCompany.save();
    })
}

module.exports.updateStatus = (data, user) => {
    return new Promise((resolve) => {
        data.supportUser = user._id;
        if (data.status === SITUACAO.ABERTO) data.supportUser = null;
        updateEntity(support, { _id: data.id }, data)
            .then(ret => { return resolve(ret) })
            .catch(ret => { return resolve(ret) })
    })
}

module.exports.dataForReport = (period, userData, status) => {
    return new Promise((resolve) => {
        findReportByDate(support, period, userData, status)
            .then(ret => {
                let file = '';
                ret.forEach(e => {
                    let line = e.company + ';' + e.name + ';' + e.date + ';' + e.time + ';' + e.closureTime + ';;' + e.comment + ';' + e.resolution
                    line = line.replace(/\n/g, '');
                    file += line + '\r\n';
                })
                return resolve(new serverReturn(200, 'Relatorio Gerado!', file));
            })
            .catch(ret => {
                return resolve(new serverReturn(403, 'Erro na geração dos dados', ret));
            })
    })
}

module.exports.manualAdjust = (data, user) => {
    return;
}


function saveUser(userData) {
    return new Promise((resolve) => {
        newRegister = new user(userData);
        newRegister.save(function (err, response) {
            if (err) resolve({ 'status': 403, 'serverMessage': err });
            resolve({ 'status': 200, 'serverMessage': 'Salvo com sucesso!', 'dbObject': response });
        })
    })
}

function findByEntity(model, data) {
    return new Promise((resolve, reject) => {
        model.find(data, function (err, response) {
            if (err) reject({ 'status': 401, 'serverMessage': err, 'dbObject': null });
            resolve({ 'status': 200, 'serverMessage': '', 'dbObject': response });
        })
    })
}

function updateEntity(model, query, newData) {
    return new Promise((resolve, reject) => {
        model.findOneAndUpdate(query, newData, { upsert: true, useFindAndModify: false }, function (err, doc) {
            if (err) return reject(new serverReturn(401, err, null));
            return resolve(new serverReturn(200, '', doc))
        })
    })
}

function generateCookie(name) {
    let value = Math.floor(Math.random() * 999) + 1;
    let days = 1
    let expires = '';
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = date.toUTCString();
    }
    return name + (value) + ' ' + expires + ";";
}

function findReportByDate(model, dateQuery, userData, status) {
    return new Promise((resolve, reject) => {
        model.find({ date: { $gte: dateQuery.start, $lte: dateQuery.end }, supportUser: userData._id, status: status }).sort({ date: 1, time: 1 })
            .then(ret => { return resolve(ret) })
            .catch(ret => { return reject(ret) })
    })
}