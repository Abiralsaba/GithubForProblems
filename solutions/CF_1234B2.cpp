#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n,m;
    if(!(cin>>n>>m)) return 0;
    vector<vector<int>> g(n);
    for(int i=0;i<m;i++){
        int u,v;
        cin>>u>>v;
        --u;--v;
        g[u].push_back(v);
        g[v].push_back(u);
    }
    vector<array<long long,3>> dp(n);
    vector<int> par(n,-1);
    vector<int> order;
    long long ans=0;
    for(int s=0;s<n;s++) if(par[s]==-1){
        par[s]=s;
        stack<int> st;
        st.push(s);
        while(!st.empty()){
            int v=st.top();st.pop();
            order.push_back(v);
            for(int to:g[v]) if(par[to]==-1){
                par[to]=v;
                st.push(to);
            }
        }
        for(int idx=(int)order.size()-1;idx>=0;idx--){
            int v=order[idx];
            long long dp0=1,dp2=0;
            vector<int> ch;
            for(int to:g[v]) if(par[to]==v) ch.push_back(to);
            for(int c:ch){
                dp0+= min({dp[c][0],dp[c][1],dp[c][2]});
                dp2+= dp[c][1];
            }
            long long dp1=LLONG_MAX/4;
            int k=ch.size();
            if(k){
                vector<long long> pref(k),suf(k);
                for(int i=0;i<k;i++){
                    long long vmin=min(dp[ch[i]][0],dp[ch[i]][1]);
                    pref[i]=vmin+(i?pref[i-1]:0);
                }
                for(int i=k-1;i>=0;i--){
                    long long vmin=min(dp[ch[i]][0],dp[ch[i]][1]);
                    suf[i]=vmin+(i+1<k?suf[i+1]:0);
                }
                for(int i=0;i<k;i++){
                    long long cand=dp[ch[i]][0]+(i?pref[i-1]:0)+(i+1<k?suf[i+1]:0);
                    dp1=min(dp1,cand);
                }
            }
            dp[v][0]=dp0;
            dp[v][1]=dp1;
            dp[v][2]=dp2;
        }
        ans+= min(dp[s][0],dp[s][1]);
        order.clear();
    }
    cout<<ans<<"\n";
    return 0;
}
