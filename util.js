function nextInt(bound) {
    return Math.floor(Math.random() * bound);
}

/**
 * Shows a message on a modal.
 * @param title The message title
 * @param message The message message
 * @param idPrefix The prefix of the modal's elements. Elements should be <prefix>Modal, <prefix>Title, <prefix>Text
 */
function showMessage(title, message, idPrefix) {
    document.getElementById(idPrefix + "Title").innerText = title;
    document.getElementById(idPrefix + "Text").innerText = message;
    eval(`$("#${idPrefix}Modal").modal("show");`);
}