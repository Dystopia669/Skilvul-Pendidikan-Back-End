const express = require('express')
const router = express.Router()
const Quiz = require('../models/Quiz')

const verifyAdmin = require('./verifyAdmin')
const { quizValidation } = require('../configs/validationQuiz')
const Kelas = require('../models/Kelas')


// CREATE
router.post('/',verifyAdmin, async (req, res) => {
    const { error } = quizValidation(req.body)
    const lokasiError = error.details[0].message.split('\"');
    // if(error) return res.status(400).json({
    //     status: res.statusCode,
    //     message: error.details[0].message
    // })

    if(error.details[0].message.includes("answer")){
        res.status(400).json({
            status: res.statusCode,
            message: "answer harus terdiri dari 4 jawaban"
        })
    }else if(error.details[0].message.includes("is required")){
        res.status(400).json({
            status: res.statusCode,
            message: "property "+lokasiError[1]+" belum diisi"
        })
    }

    const quizPost = new Quiz({
        kelas: req.body.kelas,
        nama: req.body.nama,
        bacaan: req.body.bacaan,
        soal: {
            question:req.body.soal.question,
            answer:[
                req.body.soal.answer[0],
                req.body.soal.answer[1],
                req.body.soal.answer[2],
                req.body.soal.answer[3]
            ],
            correctAnswer:req.body.soal.correctAnswer
        }
    });

    try {
        const quiz = await quizPost.save()
        res.json(quiz)
    }catch(err){
        res.json({message: err})
    }
}),

// READ
router.get('/', async (req, res) => {
    try {
        const quiz  = await Quiz.find()
        res.json(quiz)
    }catch(err){
        res.json({message: err})
    }
}),


//get quiz by Id
router.get('/:id', async (req, res) => {
    const quiz = await Quiz.findById(req.params.id)
    .then( doc => {
      if(!doc) {return res.status(404).end();}
      return res.status(200).json({doc , message: "quiz has been found"});
    })

}),


//get semua quiz yang ada di suatu kelas
router.get('/kelas/:id', async (req, res) => {
    const quiz = await Quiz.find({
        "kelas": req.params.id
      })
    .then( doc => {
      if(!doc) {return res.status(404).end();}
      return res.status(200).json({doc , message: "quiz berhasil ditemukan"});
    })

  }),

// UPDATE Quiz
router.put('/:id',verifyAdmin, async (req, res) => {
    try{
        const quizUpdate = await Quiz.updateMany({_id: req.params.id}, {
            nama: req.body.nama,
            bacaan: req.body.bacaan,
            soal: {
                question:req.body.soal.question,
                answer:[
                    req.body.soal.answer[0],
                    req.body.soal.answer[1],
                    req.body.soal.answer[2],
                    req.body.soal.answer[3]
                ],
                correctAnswer:req.body.soal.correctAnswer
            }
        })
        // res.json(quizUpdate)
        if(!quizUpdate) {
            res.status(400).json(error)
        } else {
            const quiz = await Quiz.findById(req.params.id)
            res.json(quiz)
        }
    }catch(err){
        res.json({message: err})
    }
}),

// DELETE quiz by quiz id
router.delete('/:id',verifyAdmin, async (req, res) => {
    try{
        const quiz = await Quiz.deleteOne({_id: req.params.id})
        res.json({message: "Quiz berhasil dihapus"})
    }catch(err){
        res.json({message: err})
    }
})

// Delete quiz by kelas id masih error
// router.delete('/kelas/:id', verifyAdmin, async (req,res) => {
//     try {
//         const deletequiz = await Quiz.deleteMany({_id: req.params.id})
//         if(!deletequiz){
//             res.send("Quiz by Kelas Id tidak ditemukan")
//         } else {
//             res.send("Quiz berhasil dihapus")
//         }
//     } catch (error) {
//         res.send(error)
//     }
// })



module.exports = router
