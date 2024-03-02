const Dentist = require('../models/Dentist');

//@desc Get all Dentists
//@route GET/api/v1/dentists
//@access Public
exports.getDentists = async (req, res, next) => {
    try {
        const dentists = await Dentist.find();
        res.status(200).json({success: true, count: dentists.length , data: dentists});
    } catch (err){
        res.status(400).json({success: false});
    }
}

//@desc Get single Dentist
//@route GET/api/v1/dentist/:id
//@access Public
exports.getDentist = async (req, res, next) => {
    try {
        const dentist = await Dentist.findById(req.params.id);
        if (!dentist) return res.status(400).json({success: false});
        res.status(200).json({success: true, data: dentist});
    } catch (err){
        res.status(400).json({success: false});
    }
}

//@desc Create new Dentist
//@route POST/api/v1/dentist
//@access Private
exports.createDentist = async (req, res, next) => {
    const dentist = await Dentist.create(req.body);
    res.status(201).json({success: true, data: dentist});
}

//@desc Update Dentist
//@route PUT/api/v1/dentist/:id
//@access Private
exports.updateDentist = async (req, res, next) => {
    try {
        const dentist = await Dentist.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!dentist) return res.status(400).json({success: false});
        res.status(200).json({success: true, data: dentist});
    } catch (err){
        res.status(400).json({success: false});
    }
}

//@desc Delete Dentist
//@route DELETE/api/v1/dentist/:id
//@access Private
exports.deleteDentist = async (req, res, next) => {
    try {
        const dentist = await Dentist.findByIdAndDelete(req.params.id);
        if (!dentist) return res.status(400).json({success: false});
        res.status(200).json({success: true, data: {}});
    } catch (err){
        res.status(400).json({success: false});
    }    
}