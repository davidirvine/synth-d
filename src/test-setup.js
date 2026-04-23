import '@testing-library/jest-dom'

// jsdom doesn't implement pointer capture APIs
Element.prototype.setPointerCapture = function () {}
Element.prototype.releasePointerCapture = function () {}
Element.prototype.hasPointerCapture = function () {
  return false
}
