from pydantic import BaseModel


class Sido(BaseModel):
    name: str
    code: str


class Sigungu(BaseModel):
    name: str
    code: str
