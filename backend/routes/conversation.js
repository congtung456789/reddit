const router = require("express").Router();
const middlewareController = require("../controllers/middlewareController");
const conversationController = require("../controllers/conversationController");

//CREATE CONVERSATION
router.post(
  "/",
  middlewareController.verifyToken,
  conversationController.createConversation
);

//GET CONVERSATION OF A USER
router.get(
  "/:userId",
  middlewareController.verifyToken,
  conversationController.getConversation
);

//GET AVAILABLE CONVERSATIONS BETWEEN USERS
router.get(
  "/find/:first/:second",
  middlewareController.verifyToken,
  conversationController.getAvailableConversation
);

router.post(
    "/add-user-conversation",
    middlewareController.verifyToken,
    conversationController.addNewUserToConversation
)
router.post(
    "/remove-user-conversation",
    middlewareController.verifyToken,
    conversationController.removeUserFromConversation
)
router.get(
    "/get-user-conversation/:conversationId",
    middlewareController.verifyToken,
    conversationController.getAllUserInConversation
)
router.post(
    "/update-group-name",
    middlewareController.verifyToken,
    conversationController.changeNameChatGroup
)

module.exports = router;
