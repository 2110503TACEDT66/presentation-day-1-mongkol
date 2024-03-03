const Dentist = require('../models/Dentist');
const Booking = require('../models/Booking');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('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')

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
        if(req.params.dentistId) {
            console.log(req.params.dentistId);
            query = Booking.find({dentist: req.params.dentistId}).populate({
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
        return res.status(500).json({success:false, message:"Cannot find bookings"});
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
        return res.status(500).json({ success: false, message: 'Cannot find booking' });
    }
}

// @desc    Create new appointment
// @route   POST /api/v1/hospitals/:hospitalId/appointments
// @access  Private
exports.addBooking = async (req, res, next) => {
    try {
        const dentist = await Dentist.findById(req.body.dentist);
        if (!dentist) {
            return res.status(404).json({ success: false, message: `No dentist with the id of ${req.body.dentist}` });
        } console.log(req.body);

        //add user Id to req.body
        req.body.user = req.user.id;

        const existedBooking = await Booking.find({user:req.user.id});
        if (existedBooking.length >= 1 && req.user.role !== 'admin') {
            return res.status(400).json({ success: false, message: `The user with ID ${req.user.id} has already made a booking.`});
        }
        const booking = await Booking.create(req.body);

        //send email to user
        const msg = {
            to: 'Punnarunwork@gmail.com',
            from: 'Punnarunwork@gmail.com',
            subject: 'Booking Confirmation',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #007BFF;">Booking Confirmation</h2>
                    <p>Dear Customer,</p>
                    <p>Thank you for making a booking with our dentist.</p>
                    
                    <div style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; margin-top: 20px;">
                        <p style="margin: 0;"><strong>Your Booking Details:</strong></p>
                        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                            <tr>
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Field</th>
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Value</th>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">Date</td>
                                <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${booking.bookDate}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">Dentist</td>
                                <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${booking.dentist}</td>
                            </tr>
                        </table>
                    </div>
            
                    <p style="margin-top: 20px;">We look forward to seeing you soon!</p>
                    <p>Best regards,<br>Mongkol Dental Clinic Team</p>
                </div>
            `,
        };
        
        sgMail.send(msg).then(console.log("Email Send!"))

        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Cannot create booking' });
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
            return res.status(401).json({ success: false, message: `User ${req.user.id} is not authorized to update this booking` });
        }

        let dentist = await Dentist.findById(req.body.dentist);
        if (!dentist) {
            return res.status(404).json({ success: false, message: `No dentist with the id of ${req.body.dentist}` });
        }
        
        booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Cannot update booking' });
    }
}

exports.deleteBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, message: `No booking with the id of ${req.params.id}` });
        }

        // Make sure user is appointment owner
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: `User ${req.user.id} is not authorized to delete this booking` });
        }

        await booking.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Cannot delete booking' });
    }
}