import axios from "axios"


try {
    const response = await axios.post("http://127.0.0.1:3000/api/session-manager/send-sms", {
        phone: "09215207312",
        link: "session-manager/api"
    })

    console.log(response);

} catch (error) {
    console.log(error);
}