#include <bits/stdc++.h>
using namespace std;
struct BIT{
    int n;
    vector<int> t;
    BIT(int n):n(n),t(n+1,0){}
    void add(int i,int v){for(;i<=n;i+=i&-i) t[i]+=v;}
    int sum(int i){int r=0;for(;i>0;i-=i&-i) r+=t[i];return r;}
    int range(int l,int r){if(l>r) return 0;return sum(r)-sum(l-1);}
};
int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T;cin>>T;
    while(T--){
        int n;cin>>n;
        vector<int> a(n+1), pos(n+1);
        for(int i=1;i<=n;i++) cin>>a[i], pos[a[i]]=i;
        BIT bit(n);
        for(int i=1;i<=n;i++) bit.add(i,1);
        long long ans=0;
        int cur=1;
        for(int v=1;v<=n;v++){
            int p=pos[v];
            if(p>=cur) ans+=bit.range(cur,p);
            else ans+=bit.range(cur,n)+bit.range(1,p);
            bit.add(p,-1);
            cur=p+1;
            if(cur>n) cur=1;
            while(bit.range(cur,cur)==0){
                cur++;
                if(cur>n) cur=1;
            }
        }
        cout<<ans<<"\n";
    }
    return 0;
}
