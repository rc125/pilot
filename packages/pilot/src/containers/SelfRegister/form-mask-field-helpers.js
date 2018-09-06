function handleMaskField (fieldName) {
  const newState = {}

  return (event) => {
    newState[fieldName] = event.target.value

    this.setState(newState)
  }
}

export { handleMaskField }
