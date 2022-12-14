FilePond.registerPlugin(FilePondPluginImagePreview);
FilePond.registerPlugin(FilePondPluginFileEncode);
FilePond.registerPlugin(FilePondPluginFileValidateSize);
FilePond.registerPlugin(FilePondPluginFileValidateType);

const inputElement = document.getElementById("file-upload");
const pond = FilePond.create(inputElement, {
    allowMultiple: false,
    allowFileSizeValidation: true,
    maxFileSize: '5MB',
    allowFileTypeValidation: true,
    acceptedFileTypes: ['image/png', 'image/jpeg', 'image/jpg'],
    onaddfile: (err, fileItem) => {
        document.getElementById("upload-button").disabled = false;
    },
    onupdatefiles: (files) => {
        if (files.length === 0) {
            document.getElementById("upload-button").disabled = true;
        }
    }
});

var myModalEl = document.getElementById('uploadbox')
myModalEl.addEventListener('hide.bs.modal', function (event) {
    document.getElementById("upload-button").disabled = true;
    pond.removeFiles();
    document.getElementById("upload_data").reset();
});

var myModal2 = document.getElementById('budgetbox')
myModal2.addEventListener('hide.bs.modal', function (event) {
    document.getElementById("set_budget").reset();
});

function uploadReceipt() {
    const fileBtn = document.getElementById("file-upload");
    fileBtn.click();
}

function uploadReceipt(input) {
    if (pond.getFiles().length === 0) {
        alert("Please upload a file!");
        return;
    }
    if (document.getElementById('receipt_title').value.length === 0) {
        alert("Please enter a title!");
        return;
    }
    if (document.getElementById('category').value.length === 0) {
        alert("Please select a category!");
        return;
    }

    var file = pond.getFiles()[0];
    var title_value = document.getElementById("receipt_title").value;
    var category_value = document.getElementById("category").value;
    var description_value = document.getElementById("description").value;
    var cognitoUser = userPool.getCurrentUser();

    var encoded_image = file.getFileEncodeBase64String();

    var apigClient = apigClientFactory.newClient();

    var body_data = {
        username: cognitoUser["username"],
        title: title_value,
        category: category_value,
        description: description_value,
        filename: file.filename,
        filetype: file.type,
        image: encoded_image,
    }

    var params = {
        'Content-Type': 'application/json',
        'x-api-key': 'uKo9wX1Uzb5JvLDsjl6ui7Gy8l4qFLe9Pl5SMigg',
        Accept: '*/*',
    };

    var additionalParams = {};
    apigClient
        .receiptsUploadPost(params, body_data, additionalParams)
        .then(function (res) {
            if (res.status == 200) {
                alert("Receipt uploaded Successfully");
                location.reload(); 
            } else {
                alert("Upload unsuccessful, try again later.");
            }
        });

    $('#uploadbox').modal('hide');
}

function setbudget(input) {
    if (document.getElementById('budget_amount').value.length === 0) {
        alert("Please enter a value!");
        return;
    }

    var set_amount = document.getElementById("budget_amount").value;
    var cognitoUser = userPool.getCurrentUser();

    var apigClient = apigClientFactory.newClient();

    var body_data = {
        username: cognitoUser["username"],
        amount: set_amount,
    }

    var params = {
        'Content-Type': 'application/json',
        'x-api-key': 'uKo9wX1Uzb5JvLDsjl6ui7Gy8l4qFLe9Pl5SMigg',
        Accept: '*/*',
    };

    var additionalParams = {};
    apigClient
        .budgetSetPost(params, body_data, additionalParams)
        .then(function (res) {
            if (res.status == 200) {
                alert("Budget was set successfully");
                location.reload(); 
            } else {
                alert("Budget could not be set, try again later.");
            }
        });

    $('#budgetbox').modal('hide');
}