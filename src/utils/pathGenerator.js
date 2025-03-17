export const pathGenerator=(filename)=>
{
  const image = filename
    ? `${process.env.BASE_URL}/${filename}`
    : null
    return image;
}