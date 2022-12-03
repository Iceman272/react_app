/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getNote = /* GraphQL */ `
  query GetNote($id: ID!) {
    getNote(id: $id) {
      id
      owner
      order_number
      course_name
      course_number
      credit
      grade
      taken
      semester_taken
      createdAt
      updatedAt
    }
  }
`;
export const listNotes = /* GraphQL */ `
  query ListNotes(
    $filter: ModelNoteFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listNotes(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        owner
        order_number
        course_name
        course_number
        credit
        grade
        taken
        semester_taken
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
