# generates logo.svg and favicon.svg (pixel art)
G={'W':"10001 10001 10101 11011 10001",'E':"11111 10000 11110 10000 11111",'B':"11110 10001 11110 10001 11110",
'A':"01110 10001 11111 10001 10001",'L':"10000 10000 10000 10000 11111",'C':"01111 10000 10000 10000 01111",
'H':"10001 10001 11111 10001 10001",'M':"10001 11011 10101 10001 10001",'Y':"10001 01010 00100 00100 00100"}
FLASK=["....oooo....","....o..o....","....o..o....","....o..o....","...oo..oo...","..o......o..",".o........o.",
".o..bll...o.","o..llllll..o","o.llllllll.o","o.llblllll.o",".oooooooooo."]
COL={'o':'#2b1b4d','l':'#ff4fa3','b':'#ffe66d'}
def rects(grid,ox,oy,col):
    return ''.join(f'<rect x="{ox+x}" y="{oy+y}" width="1" height="1" fill="{col(c)}"/>' for y,r in enumerate(grid) for x,c in enumerate(r) if c not in '.0')
def svg(w,h,body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" shape-rendering="crispEdges">{body}</svg>'
open('favicon.svg','w').write(svg(12,12,'<rect width="12" height="12" fill="#ffe66d"/>'+rects(FLASK,0,0,lambda c:COL[c])))
body=''
def text(s,ox,oy,color):
    out=''
    for i,ch in enumerate(s):
        rows=G[ch].split()
        out+=rects(rows,ox+i*6,oy,lambda c:color)
    return out
# shadow then colour, 'WEB' cyan / 'ALCHEMY' pink
W=14+10*6+1
body+=rects(FLASK,0,1,lambda c:COL[c])
body+=text('WEB',14+1,5+1,'#2b1b4d')+text('ALCHEMY',14+1+18,5+1,'#2b1b4d')
body+=text('WEB',14,5,'#4de1ff')+text('ALCHEMY',14+18,5,'#ffe66d')
open('logo.svg','w').write(svg(W,13,body))
