export const listContainer = {
  routes: [
    { name: "Home", path: "/" },
    // bỏ đi chức năng hiển thị các thông tin hot
    //{ name: "News", path: "/news" },
    { name: "Friends", path: "/friends" },
  ],
  tags: ["None", "Sad", "Feeling", "Happy", "Feeling bad"],
  avaUrl: [
    "https://preview.redd.it/rrz3hmsxcll71.png?width=640&crop=smart&auto=webp&s=87cc5ed38d8f088ef9fffef7a4c5756b64309d6a",
    "https://preview.redd.it/fc9k38jwfwv51.png?auto=webp&s=9ce3d4c488091bb21969fd0fad7a6d89e4bfc50d",
    "https://preview.redd.it/se39g98mljw51.png?auto=webp&s=758dfe2b0a2df439b06b68533e763f413d58b46c",
    "https://preview.redd.it/5es1lne1du261.png?width=640&crop=smart&auto=webp&s=e6eb0ee5710710000e4fbace119112de63324a38",
    "https://i.redd.it/7ipyf6pvqac61.png",
    "https://i.redd.it/ksmb0m02ppy51.png",
    "https://i.redd.it/mozfkrjpoa261.png",
    "https://preview.redd.it/cpwkbke13vv51.png?auto=webp&s=9158e49b35ad2581d840efd2a013a9ead06abbc7",
    "https://preview.redd.it/26s9eejm8vz51.png?auto=webp&s=e38d32ee0ffa0666fade2abd62ed59037c119990",
  ],
};
export const baseURL = "http://192.168.0.101:8088/v1";
export const baseURLSocket = "http://192.168.0.101:8089";

export const formatTime = (time) => {
  const date = new Date(time * 1000);
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();
  const second = ("0" + date.getUTCSeconds()).slice(-2);
  if (hour) {
    return `${hour}:${("0" + minute).slice(-2)}:${second}`;
  }
  return `${minute}:${second}`;
};
export function isFileImage(file) {
  const acceptedImageTypes = ["image/gif", "image/jpeg", "image/png"];

  return file && acceptedImageTypes.includes(file["type"]);
}
export function isExtImage(fileBase64) {
  let ext = fileBase64.split(",")[0].split(":")[1].split(";")[0].split("/")[1];
  const acceptedImageTypes = ["gif", "jpeg", "png", "jpg"];
  console.log(acceptedImageTypes.includes(ext));
  return acceptedImageTypes.includes(ext);
}
