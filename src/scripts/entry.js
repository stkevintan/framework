function DragUpload($elem){
  this.$elem = $elem;
  this.$preview = $('.preview-zone',$elem);
  this.$drop = $('.drop-zone',$elem);
  this.$fileInput = $('input',this.$drop);
  this.$drop.on('dragover',() => {
    this.$drop.addClass('dropping');
  });
  this.$drop.on('dragleave',()=>{
    this.$drop.removeClass('dropping');
  });
  this.$fileInput.on('change',()=>{
    this.onChnage(this.$fileInput[0].files);
  });
}
DragUpload.prototype = {
  constructor:DragUpload,
  onChnage:function(files){
    this.$drop.removeClass('dropping');
    if(files.length === 0) return false;
    for(let i=0;i<files.length;i++){
      let file = files[i];
      if(file.type.indexOf('image')!==-1){
        this.addImage(file);
      }
    }
  },
  addImage:function(file){
    console.log(file);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener('load',() => {
      this.addPreview(reader.result,file.name);
    });
  },
  addPreview:function(url,name){
    this.$preview.append(`
      <div class='preview-box'>
        <img src="${url}" />
        <p>${name}</p>
      </div>
    `)
  }
}

$(() => {
    console.log('=w=');
    const up = new DragUpload($('.upload'));
});
