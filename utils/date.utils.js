exports.getDate = () => {
  var currentdate = new Date();
  var datetime =
    currentdate.getFullYear() +
    "-" +
    (currentdate.getMonth() + 1) +
    "-" +
    currentdate.getDate() +
    " " +
    currentdate.getHours() +
    ":" +
    currentdate.getMinutes() +
    ":" +
    currentdate.getSeconds();
  return datetime;
};

exports.durationTime=(date1,date2)=>{
  const d1=new Date(date1);
  const d2=new Date(date2);
  const milli=d2-d1;
  const sec=milli/1000;
  return sec;
}

exports.checkTime=(t1,t2)=>{
  if(t1<=t2){
    return true;
  }else{
    return false;
  }
}
   
