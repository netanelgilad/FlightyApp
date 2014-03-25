function Matrix(){var t=Array.prototype.concat.apply([],arguments);t.length||(t=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),this.m=hasFloat32Array?new Float32Array(t):t}var hasFloat32Array="undefined"!=typeof Float32Array;Matrix.prototype={inverse:function(){return Matrix.inverse(this,new Matrix)},transpose:function(){return Matrix.transpose(this,new Matrix)},multiply:function(t){return Matrix.multiply(this,t,new Matrix)},transformPoint:function(t){var r=this.m;return new Vector(r[0]*t.x+r[1]*t.y+r[2]*t.z+r[3],r[4]*t.x+r[5]*t.y+r[6]*t.z+r[7],r[8]*t.x+r[9]*t.y+r[10]*t.z+r[11]).divide(r[12]*t.x+r[13]*t.y+r[14]*t.z+r[15])},transformVector:function(t){var r=this.m;return new Vector(r[0]*t.x+r[1]*t.y+r[2]*t.z,r[4]*t.x+r[5]*t.y+r[6]*t.z,r[8]*t.x+r[9]*t.y+r[10]*t.z)}},Matrix.inverse=function(t,r){r=r||new Matrix;var n=t.m,a=r.m;a[0]=n[5]*n[10]*n[15]-n[5]*n[14]*n[11]-n[6]*n[9]*n[15]+n[6]*n[13]*n[11]+n[7]*n[9]*n[14]-n[7]*n[13]*n[10],a[1]=-n[1]*n[10]*n[15]+n[1]*n[14]*n[11]+n[2]*n[9]*n[15]-n[2]*n[13]*n[11]-n[3]*n[9]*n[14]+n[3]*n[13]*n[10],a[2]=n[1]*n[6]*n[15]-n[1]*n[14]*n[7]-n[2]*n[5]*n[15]+n[2]*n[13]*n[7]+n[3]*n[5]*n[14]-n[3]*n[13]*n[6],a[3]=-n[1]*n[6]*n[11]+n[1]*n[10]*n[7]+n[2]*n[5]*n[11]-n[2]*n[9]*n[7]-n[3]*n[5]*n[10]+n[3]*n[9]*n[6],a[4]=-n[4]*n[10]*n[15]+n[4]*n[14]*n[11]+n[6]*n[8]*n[15]-n[6]*n[12]*n[11]-n[7]*n[8]*n[14]+n[7]*n[12]*n[10],a[5]=n[0]*n[10]*n[15]-n[0]*n[14]*n[11]-n[2]*n[8]*n[15]+n[2]*n[12]*n[11]+n[3]*n[8]*n[14]-n[3]*n[12]*n[10],a[6]=-n[0]*n[6]*n[15]+n[0]*n[14]*n[7]+n[2]*n[4]*n[15]-n[2]*n[12]*n[7]-n[3]*n[4]*n[14]+n[3]*n[12]*n[6],a[7]=n[0]*n[6]*n[11]-n[0]*n[10]*n[7]-n[2]*n[4]*n[11]+n[2]*n[8]*n[7]+n[3]*n[4]*n[10]-n[3]*n[8]*n[6],a[8]=n[4]*n[9]*n[15]-n[4]*n[13]*n[11]-n[5]*n[8]*n[15]+n[5]*n[12]*n[11]+n[7]*n[8]*n[13]-n[7]*n[12]*n[9],a[9]=-n[0]*n[9]*n[15]+n[0]*n[13]*n[11]+n[1]*n[8]*n[15]-n[1]*n[12]*n[11]-n[3]*n[8]*n[13]+n[3]*n[12]*n[9],a[10]=n[0]*n[5]*n[15]-n[0]*n[13]*n[7]-n[1]*n[4]*n[15]+n[1]*n[12]*n[7]+n[3]*n[4]*n[13]-n[3]*n[12]*n[5],a[11]=-n[0]*n[5]*n[11]+n[0]*n[9]*n[7]+n[1]*n[4]*n[11]-n[1]*n[8]*n[7]-n[3]*n[4]*n[9]+n[3]*n[8]*n[5],a[12]=-n[4]*n[9]*n[14]+n[4]*n[13]*n[10]+n[5]*n[8]*n[14]-n[5]*n[12]*n[10]-n[6]*n[8]*n[13]+n[6]*n[12]*n[9],a[13]=n[0]*n[9]*n[14]-n[0]*n[13]*n[10]-n[1]*n[8]*n[14]+n[1]*n[12]*n[10]+n[2]*n[8]*n[13]-n[2]*n[12]*n[9],a[14]=-n[0]*n[5]*n[14]+n[0]*n[13]*n[6]+n[1]*n[4]*n[14]-n[1]*n[12]*n[6]-n[2]*n[4]*n[13]+n[2]*n[12]*n[5],a[15]=n[0]*n[5]*n[10]-n[0]*n[9]*n[6]-n[1]*n[4]*n[10]+n[1]*n[8]*n[6]+n[2]*n[4]*n[9]-n[2]*n[8]*n[5];for(var i=n[0]*a[0]+n[1]*a[4]+n[2]*a[8]+n[3]*a[12],e=0;16>e;e++)a[e]/=i;return r},Matrix.transpose=function(t,r){r=r||new Matrix;var n=t.m,a=r.m;return a[0]=n[0],a[1]=n[4],a[2]=n[8],a[3]=n[12],a[4]=n[1],a[5]=n[5],a[6]=n[9],a[7]=n[13],a[8]=n[2],a[9]=n[6],a[10]=n[10],a[11]=n[14],a[12]=n[3],a[13]=n[7],a[14]=n[11],a[15]=n[15],r},Matrix.multiply=function(t,r,n){n=n||new Matrix;var a=t.m,i=r.m,e=n.m;return e[0]=a[0]*i[0]+a[1]*i[4]+a[2]*i[8]+a[3]*i[12],e[1]=a[0]*i[1]+a[1]*i[5]+a[2]*i[9]+a[3]*i[13],e[2]=a[0]*i[2]+a[1]*i[6]+a[2]*i[10]+a[3]*i[14],e[3]=a[0]*i[3]+a[1]*i[7]+a[2]*i[11]+a[3]*i[15],e[4]=a[4]*i[0]+a[5]*i[4]+a[6]*i[8]+a[7]*i[12],e[5]=a[4]*i[1]+a[5]*i[5]+a[6]*i[9]+a[7]*i[13],e[6]=a[4]*i[2]+a[5]*i[6]+a[6]*i[10]+a[7]*i[14],e[7]=a[4]*i[3]+a[5]*i[7]+a[6]*i[11]+a[7]*i[15],e[8]=a[8]*i[0]+a[9]*i[4]+a[10]*i[8]+a[11]*i[12],e[9]=a[8]*i[1]+a[9]*i[5]+a[10]*i[9]+a[11]*i[13],e[10]=a[8]*i[2]+a[9]*i[6]+a[10]*i[10]+a[11]*i[14],e[11]=a[8]*i[3]+a[9]*i[7]+a[10]*i[11]+a[11]*i[15],e[12]=a[12]*i[0]+a[13]*i[4]+a[14]*i[8]+a[15]*i[12],e[13]=a[12]*i[1]+a[13]*i[5]+a[14]*i[9]+a[15]*i[13],e[14]=a[12]*i[2]+a[13]*i[6]+a[14]*i[10]+a[15]*i[14],e[15]=a[12]*i[3]+a[13]*i[7]+a[14]*i[11]+a[15]*i[15],n},Matrix.identity=function(t){t=t||new Matrix;var r=t.m;return r[0]=r[5]=r[10]=r[15]=1,r[1]=r[2]=r[3]=r[4]=r[6]=r[7]=r[8]=r[9]=r[11]=r[12]=r[13]=r[14]=0,t},Matrix.perspective=function(t,r,n,a,i){var e=Math.tan(t*Math.PI/360)*n,o=e*r;return Matrix.frustum(-o,o,-e,e,n,a,i)},Matrix.frustum=function(t,r,n,a,i,e,o){o=o||new Matrix;var u=o.m;return u[0]=2*i/(r-t),u[1]=0,u[2]=(r+t)/(r-t),u[3]=0,u[4]=0,u[5]=2*i/(a-n),u[6]=(a+n)/(a-n),u[7]=0,u[8]=0,u[9]=0,u[10]=-(e+i)/(e-i),u[11]=-2*e*i/(e-i),u[12]=0,u[13]=0,u[14]=-1,u[15]=0,o},Matrix.ortho=function(t,r,n,a,i,e,o){o=o||new Matrix;var u=o.m;return u[0]=2/(r-t),u[1]=0,u[2]=0,u[3]=-(r+t)/(r-t),u[4]=0,u[5]=2/(a-n),u[6]=0,u[7]=-(a+n)/(a-n),u[8]=0,u[9]=0,u[10]=-2/(e-i),u[11]=-(e+i)/(e-i),u[12]=0,u[13]=0,u[14]=0,u[15]=1,o},Matrix.scale=function(t,r,n,a){a=a||new Matrix;var i=a.m;return i[0]=t,i[1]=0,i[2]=0,i[3]=0,i[4]=0,i[5]=r,i[6]=0,i[7]=0,i[8]=0,i[9]=0,i[10]=n,i[11]=0,i[12]=0,i[13]=0,i[14]=0,i[15]=1,a},Matrix.translate=function(t,r,n,a){a=a||new Matrix;var i=a.m;return i[0]=1,i[1]=0,i[2]=0,i[3]=t,i[4]=0,i[5]=1,i[6]=0,i[7]=r,i[8]=0,i[9]=0,i[10]=1,i[11]=n,i[12]=0,i[13]=0,i[14]=0,i[15]=1,a},Matrix.rotate=function(t,r,n,a,i){if(!t||!r&&!n&&!a)return Matrix.identity(i);i=i||new Matrix;var e=i.m,o=Math.sqrt(r*r+n*n+a*a);t*=Math.PI/180,r/=o,n/=o,a/=o;var u=Math.cos(t),x=Math.sin(t),M=1-u;return e[0]=r*r*M+u,e[1]=r*n*M-a*x,e[2]=r*a*M+n*x,e[3]=0,e[4]=n*r*M+a*x,e[5]=n*n*M+u,e[6]=n*a*M-r*x,e[7]=0,e[8]=a*r*M-n*x,e[9]=a*n*M+r*x,e[10]=a*a*M+u,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,i},Matrix.lookAt=function(t,r,n,a,i,e,o,u,x,M){M=M||new Matrix;var s=M.m,c=new Vector(t,r,n),f=new Vector(a,i,e),m=new Vector(o,u,x),y=c.subtract(f).unit(),v=m.cross(y).unit(),w=y.cross(v).unit();return s[0]=v.x,s[1]=v.y,s[2]=v.z,s[3]=-v.dot(c),s[4]=w.x,s[5]=w.y,s[6]=w.z,s[7]=-w.dot(c),s[8]=y.x,s[9]=y.y,s[10]=y.z,s[11]=-y.dot(c),s[12]=0,s[13]=0,s[14]=0,s[15]=1,M};