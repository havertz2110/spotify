key ="Anjysfrjxj"
def tranfer(a):
    v3= a
    if ( (v3 <= 96 or v3 > 122) and (v3 <= 64 or v3 > 90) ):   
      if ( v3 > 47 and v3 <= 57 ):
        v3 = (v3 - 48 + 5) % 10 + 48
    
    else:
      if ( v3 <= 96 ):
        v2 = 65
      else:
        v2 = 97
      v3 = (v3 - v2 + 5) % 26 + v2
    return v3
flag=[]
for i in key :
   for j in range (32,127):
      tmp = tranfer(j)
      if(tmp == ord(i)):
       flag.append(chr(j))
       break
for i in flag :
    print(i,end="")



# flag_enc = chr(0x15) + chr(0x07) + chr(0x08) + chr(0x06) + chr(0x27) + chr(0x21) + chr(0x23) + chr(0x15) + chr(0x5c) + chr(0x01) + chr(0x57) + chr(0x2a) + chr(0x17) + chr(0x5e) + chr(0x5f) + chr(0x0d) + chr(0x3b) + chr(0x19) + chr(0x56) + chr(0x5b) + chr(0x5e) + chr(0x36) + chr(0x53) + chr(0x07) + chr(0x51) + chr(0x18) + chr(0x58) + chr(0x05) + chr(0x57) + chr(0x11) + chr(0x3a) + chr(0x0f) + chr(0x0e) + chr(0x59) + chr(0x06) + chr(0x4d) + chr(0x55) + chr(0x0c) + chr(0x0f) + chr(0x14)
# def str_xor(secret, key):
#     #extend key to secret length
#     new_key = key
#     i = 0
#     while len(new_key) < len(secret):
#         new_key = new_key + key[i]
#         i = (i + 1) % len(key)        
#     return "".join([chr(ord(secret_c) ^ ord(new_key_c)) for (secret_c,new_key_c) in zip(secret,new_key)])

# def print_flag():
#   flag = str_xor(flag_enc, 'enkidu')
#   print(flag)

# print_flag()
# def check():
#     data=[0x6D, 0x61, 0x64, 0x75, 0x69, 0x65, 0x72, 0x73, 0x6E, 0x66, 
#   0x6F, 0x74, 0x76, 0x62, 0x79, 0x6C]
    
#     key="sabres"
#     arr=[ord(i) for i in key]
#     index=[]
#     for i in arr :
#         index.append(data.index(i))
#     print(index)
#     for i in index:
#         # if(i < 32): i+=32
#         print(chr(i),end="")
    
# print(0x32 & 0xF)
# check()

