import Joi from "joi";

const validation_message = "This Field is required"; 

export const validateFormData = async (data, validationSchema) => {
  try {
   
    validationSchema = validationSchema.keys({
      access_token: Joi.string(), 
    }).messages({
      "any.required": validation_message, 
      "any.empty": validation_message, 
      "string.empty": validation_message, 
      "number.empty": validation_message,
    });

    // Validate the data against the schema
    const { error } = validationSchema.validate(data, { abortEarly: false }); 

    if (error) {
      const allErrors = {};

      // Format the error messages into a structured object
      error.details.forEach((err) => {
        if (err.path[1] !== undefined && err.path[2] !== undefined) {
          allErrors[err.path[2] + "." + err.path[1]] = err.message.replace(
            /"/g,
            ""
          );
        } else {
          allErrors[err.path[0]] = err.message.replace(/"/g, "");
        }
      });
      return {
        status: false,
        errors: allErrors,
      };
    } else {
      return {
        status: true,
        errors: "",
      };
    }
  } catch (error) {
    console.error("Error in validateFormData:", error);
    return {
      status: false,
      errors: { general: "An unexpected error occurred" },
    };
  }
};


export const newValidateFormData = async (data, validationSchema) => {
  try {
    // Extend the schema with the access_token field
    validationSchema = validationSchema.keys({
      access_token: Joi.string(),
    });

    // Validate the data
    const { error } = validationSchema.validate(data, { abortEarly: false });

    if (error) {
      const allErrors = {};

      // Transform Joi error details into the desired error structure
      error.details.forEach((err) => {
        const path = err.path; // Path array from Joi error
        if (path.length > 1) {
          // Handle nested keys
          allErrors[`${path[1]}`] = err.message.replace(/"/g, "");
        } else {
          // Handle top-level keys
          allErrors[path[0]] = err.message.replace(/"/g, "");
        }
      });

      return {
        status: false,
        errors: allErrors,
      };
    }

    // Return success if no errors
    return {
      status: true,
      errors: "",
    };
  } catch (error) {
    console.error("Validation Error:", error);
    return {
      status: false,
      errors: { general: "Validation failed due to an unexpected error." },
    };
  }
};



