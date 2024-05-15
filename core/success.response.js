
const StatusCode = {
    OK: 200,
    CREATED: 201
}

const ResultCodeMessage = {
    OK: 'Successfully!',
    CREATED: "CREATED!"
}

class SuccessResponse{
    constructor({message, metadata={}, statusCode=StatusCode.OK, result=ResultCodeMessage.OK}){
        this.message = message ? message : result
        this.metadata = metadata
        this.status = statusCode
    }
    send(res, headers={}){
        return res.status(this.status).json(this)
    }
}

class Ok extends SuccessResponse{
    // SuccessResponse được tạo nên dựa trên class Ok do đó viêc ta cần chỉ cho class Ok kế thừa là đủ
    constructor({message, metadata}){
        super({message, metadata})
    }
}

class Created extends SuccessResponse{
    // lúc này do Created có các thông tin khác khác nhiều successResponse do đó ta cần truyền nhiều tham số vào bên trong
    constructor({options, message, metadata, statusCode=StatusCode.CREATED, result=ResultCodeMessage.CREATED}){
        super({message, metadata, statusCode, result})
        this.options = options
    }
}


module.exports = {
    Ok,
    Created,
    SuccessResponse
}