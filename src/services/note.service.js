"use strict";

class NoteService {
  static sayHello = async ({ dataInfo }) => {
    console.log(123);
    return {
      data: "Hello, World! " + dataInfo,
    };
  };
}

module.exports = NoteService;
