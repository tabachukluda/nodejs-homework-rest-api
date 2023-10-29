const { Schema, model } = require('mongoose');

const { handleSaveError, runValidatorsAtUpdate } = require ('./hooks.js')

const contactSchema = new Schema(
    {
		name: {
			type: String,
			required: [true, 'Set name for contact'],
		},
		email: {
			type: String,			
		},
		phone: {
			type: String,
		},
		favorite: {
			type: Boolean,
			default: false,
		},
		owner: {
        type: Schema.Types.ObjectId,
		ref: 'user',
		
        }
	}, {versionKey: false, timestamps: true})

contactSchema.post("save", handleSaveError);

contactSchema.pre("findOneAndUpdate", runValidatorsAtUpdate);

contactSchema.post("findOneAndUpdate", handleSaveError);

const Contact = model('contact', contactSchema);

module.exports = Contact;