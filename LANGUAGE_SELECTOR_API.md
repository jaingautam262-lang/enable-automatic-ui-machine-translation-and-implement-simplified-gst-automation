# Language Selector API Documentation

## Overview
The Language Selector API allows users to manage their language preferences for the application. It includes endpoints for retrieving the current language, setting user language preferences, listing all available languages for translation, and batch translating items.

## Endpoints

### 1. Get Current Language
**GET `/api/user/language`**  
- **Description**: Retrieves the current language setting for the user.  
- **Response**:  
  - `200 OK`: Returns the current language in JSON format.  
  - Example response:  
    ```json  
    {  
        "language": "en"  
    }  
    ```

### 2. Set Language Preference
**POST `/api/user/language`**  
- **Description**: Sets the user's preferred language.  
- **Request Body**:  
  - `language`: The language code to set (e.g., `en`, `fr`, `es`).  
- **Response**:  
  - `204 No Content`: Language preference updated successfully.  

### 3. List All Languages
**GET `/api/translation/all-languages`**  
- **Description**: Lists all 100+ languages available for translation.  
- **Response**:  
  - `200 OK`: Returns a list of all languages in JSON format.  
  - Example response:  
    ```json  
    [  
        {  
            "code": "en",  
            "name": "English"  
        },  
        {  
            "code": "fr",  
            "name": "French"  
        }  
        // ... more languages  
    ]  
    ```

### 4. Batch Translate
**POST `/api/batch-translate`**  
- **Description**: Translates multiple items in one request.  
- **Request Body**:  
  - `items`: An array of objects that need to be translated. Each object contains:  
    - `text`: The text to translate.  
    - `language`: The target language code.  
- **Response**:  
  - `200 OK`: Returns an array of translated items.  
  - Example response:  
    ```json  
    [  
        {  
            "original": "Hello",  
            "translated": "Hola",  
            "language": "es"  
        }  
        // ... more translated items  
    ]  
    ```

### 5. Language-Specific Record Retrieval
**GET `/api/translation/{language}`**  
- **Description**: Retrieves records specific to the given language code.  
- **Response**:  
  - `200 OK`: Returns a list of records in JSON format for the specified language.  
  - Example response:  
    ```json  
    [  
        {  
            "record_id": 1,  
            "text": "Bonjour",  
            "language": "fr"  
        }  
        // ... more records  
    ]  
    ```

## Conclusion
This API provides the necessary functionality for users to interact seamlessly with the language selection features, ensuring a personalized experience in multiple languages.