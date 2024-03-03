const Dentist = require('../models/Dentist');
const Booking = require('../models/Booking');

// @desc    Get all bookings
// @route   GET/api/bookings
// @access  Public
exports.getBookings = async (req, res, next) => {
    let query;
    if (req.user.role !== 'admin') {
        query = Booking.find({user: req.user.id}).populate({
            path: 'dentist',
            select: 'name'
        });
    }
    else {
        if(req.params.detistId) {
            console.log(req.params.dentistId);
            query = Booking.find({hospital: req.params.dentistId}).populate({
                path: 'dentist',
                select: 'name'
            });
        }
        else {
            query = Booking.find().populate({
                path: 'dentist',
                select: 'name'
            });
        }
    }
    try{
        const bookings = await query;
        res.status(200).json({success: true, count: bookings.length, data: bookings});
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message:"Cannot find Bookings"});
    }
};

exports.getBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id).populate({
            path: 'dentist',
            select: 'name yearOfExperience areaOfExpertise'
        });


        if (!booking) {
            return res.status(404).json({ success: false , message: `No booking with the id of ${req.params.id}` });
        }
        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Cannot find Booking' });
    }
}

// @desc    Create new appointment
// @route   POST /api/v1/hospitals/:hospitalId/appointments
// @access  Private
exports.addBooking = async (req, res, next) => {
    try {
        req.body.dentist = req.params.dentistId;
        
        const dentist = await Dentist.findById(req.params.dentistId);
        if (!dentist) {
            return res.status(404).json({ success: false, message: `No hospital with the id of ${req.params.dentistId}` });
        } console.log(req.body);

        //add user Id to req.body
        req.body.user = req.user.id;

        const existedBooking = await Booking.find({user:req.user.id});
        if (existedBooking.length >= 1 && req.user.role !== 'admin') {
            return res.status(400).json({ success: false, message: `The user with ID ${req.user.id} has already made 3 appointments.`});
        }
        const booking = await Booking.create(req.body);
        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Cannot create Appointment' });
    }
};

exports.updateBooking = async (req, res, next) => {
    try {
        let booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, message: `No booking with the id of ${req.params.id}` });
        }

        // Make sure user is appointment owner
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: `User ${req.user.id} is not authorized to update this appointment` });
        }

        booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Cannot update Appointment' });
    }
}

exports.deleteBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, message: `No appointment with the id of ${req.params.id}` });
        }

        // Make sure user is appointment owner
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: `User ${req.user.id} is not authorized to delete this appointment` });
        }

        await booking.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Cannot delete Appointment' });
    }
}