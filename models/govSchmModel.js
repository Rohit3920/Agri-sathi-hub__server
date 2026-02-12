const mongoose = require("mongoose");

const schemeSchema = new mongoose.Schema(
    {
        scheme_id: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        scheme_name: {
            type: String,
            required: true,
            trim: true,
        },

        scheme_type: {
            type: String,
            trim: true,
        },

        target_beneficiaries: {
            type: String,
            trim: true,
        },

        benefit_type: {
            type: String,
            trim: true,
        },

        benefit_amount: {
            type: String,
            trim: true,
        },

        state: {
            type: [String],
            index: true,
            trim: true,
        },

        beneficiaries_count: {
            type: String,
            trim: true,
        },

        fund_disbursed_core: {
            type: String,
            trim: true,
        },

        scheme_status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active",
        },

        launch_year: {
            type: Number,
        },

        eligibility_criteria: {
            type: String,
            trim: true,
        },

        scheme_website_link: {
            type: String,
            trim: true,
        },

        document_required_column: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("myschemes", schemeSchema);