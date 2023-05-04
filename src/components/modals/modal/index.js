import Modal from './Modal.vue';
import Vue from 'vue';

const modal = Vue.extend(Modal);
let zIndex = 123456789;
let instance = new modal({ el: document.createElement('div') })
export default (options = {}) => {
    document.body.appendChild(instance.$el)
}