const formattedDate = function formattedDate(){
    const rightNow = new Date(Date.now());
    
    const dateFormatOptions = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
    };

    let rightNowFormatted = rightNow.toLocaleDateString('en-US', dateFormatOptions);

    rightNowFormatted = rightNowFormatted.replace(/\//g, '-');
    rightNowFormatted = rightNowFormatted.replace(/,/g, '');
    
    return rightNowFormatted;
}

export default formattedDate;