const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase URL or Key is not defined. Please check your environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseKey);


const uploadImageToBucket = async (req, res, bucketName, successMessage) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const file = req.file;

        console.log(`Uploading to bucket: ${bucketName}`);
        console.log('File name:', file.originalname);
        console.log('File mimetype:', file.mimetype);
        console.log('File size:', file.size);

        const fileExtension = file.originalname.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
        const filePath = `public/${fileName}`;

        const { error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (error) {
            console.error('Supabase upload error:', error);
            return res.status(500).json({ message: `Failed to upload image: ${error.message}` });
        }

        const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        if (!publicUrlData || !publicUrlData.publicUrl) {
            return res.status(500).json({
                message: 'Image uploaded but failed to retrieve public URL.'
            });
        }

        return res.status(200).json({
            message: successMessage,
            imageUrl: publicUrlData.publicUrl
        });

    } catch (error) {
        console.error('Error uploading image:', error);
        return res.status(500).json({
            error: error.message || 'Internal server error during image upload.'
        });
    }
};


// 1️⃣ Profile Image
const uploadProfileImage = (req, res) => {
    return uploadImageToBucket(
        req,
        res,
        'profiles',
        'Profile image uploaded successfully!'
    );
};

// 2️⃣ Hire Worker Image
const uploadHireWorkerImage = (req, res) => {
    return uploadImageToBucket(
        req,
        res,
        'hireWorker',
        'Hire worker image uploaded successfully!'
    );
};

// 3️⃣ Hire Worker Group Image
const uploadHireWorkerGroupImage = (req, res) => {
    return uploadImageToBucket(
        req,
        res,
        'hireWorkerGroup',
        'Hire worker group image uploaded successfully!'
    );
};

// 4️⃣ Machine Rental Image
const uploadMachineRentalImage = (req, res) => {
    return uploadImageToBucket(
        req,
        res,
        'MachineRental',
        'Machine rental image uploaded successfully!'
    );
};


module.exports = {
    uploadProfileImage,
    uploadHireWorkerImage,
    uploadHireWorkerGroupImage,
    uploadMachineRentalImage
};