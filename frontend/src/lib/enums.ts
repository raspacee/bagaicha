/* Filter form enum for distance */
export enum Distances {
  NONE = 0,
  ONE = 1,
  TWO = 2,
  FIVE = 5,
  TEN = 10,
}

export enum FetchState {
  IDLE /* nothing is being done */,
  FETCHING /* data is being fetched */,
  NOT_FOUND /* data was empty */,
  ERROR /* error happened */,
  COMPLETED,
}
