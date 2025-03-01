/**
 * 后端API地址
 */
export const enum KnowApi {
  UploadFile = "/knowledge/file/upload",
  QueryFile = "/knowledge/contents",
  DeleteFile = "/knowledge/delete",
  DownloadFile = "/knowledge/download",
}

export const enum ChatApi {
  StreamChat = "/chat/stream",
  SimpleChat = "/chat/simple",
  Models = "/chat/models",
}

export const enum RagApi {
  StreamRag = "/ai/rag",
}

export const enum OneApi {
  AddOneApi = "/one-api",
  QueryApi = "/select",
  ChangeApi = "/change/",
  QueryOneApi = "/select/",
  DeleteOneApi = "/delete/",
  DeleteApi = "/delete",
}

export const enum DrawApi {
  DrawApi = "/draw/",
}
