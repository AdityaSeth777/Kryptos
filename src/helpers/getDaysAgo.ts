// Returns a date 'offset' days ago
export default (offset: number) => {
  let date = new Date()

  date.setDate(date.getDate() - offset)

  return date
}
