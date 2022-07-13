import { store } from "../setup/addMiddlewear";

module.exports = () => {
    store.shutdown()
}